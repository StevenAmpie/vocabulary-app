import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { randomBytes, randomUUID } from 'node:crypto';
import { FastifyReply } from 'fastify';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import {
  LoginOptionsDto,
  RegisterOptionsDto,
  VerifyLoginDto,
  VerifyRegistrationDto,
} from './auth.dto';
import { AuthenticatedUser, PendingAuthentication, PendingRegistration } from './auth.types';

const CHALLENGE_TTL_SECONDS = 60;

@Injectable()
export class AuthService {
  private readonly rpName: string;
  private readonly rpId: string;
  private readonly origin: string;
  private readonly sessionTtlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.rpName = this.config.get<string>('RP_NAME') ?? 'Vocabulary App';
    this.rpId = this.config.get<string>('RP_ID') ?? 'localhost';
    this.origin = this.config.get<string>('ORIGIN') ?? 'http://localhost:3000';
    this.sessionTtlSeconds = Number(this.config.get('SESSION_TTL_SECONDS') ?? 2_592_000);
  }

  async registrationOptions(dto: RegisterOptionsDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { passkeys: true },
    });
    const userId = existingUser?.id ?? randomUUID();
    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpId,
      userID: userId,
      userName: email,
      userDisplayName: dto.displayName.trim(),
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      excludeCredentials: existingUser?.passkeys.map((credential) => ({
        id: Buffer.from(credential.credentialId, 'base64url'),
        type: 'public-key',
        transports: credential.transports as never[],
      })),
    });
    const pending: PendingRegistration = {
      challenge: options.challenge,
      userId,
      email,
      displayName: dto.displayName.trim(),
    };
    await this.redis.set(
      `webauthn:register:${email}`,
      JSON.stringify(pending),
      CHALLENGE_TTL_SECONDS,
    );
    return options;
  }

  async verifyRegistration(dto: VerifyRegistrationDto, reply: FastifyReply) {
    const email = dto.email.trim().toLowerCase();
    const rawPending = await this.redis.getAndDelete(`webauthn:register:${email}`);
    if (!rawPending) throw new BadRequestException('El desafío de registro expiró.');
    const pending = JSON.parse(rawPending) as PendingRegistration;

    const verification = await verifyRegistrationResponse({
      response: dto.registrationResponse,
      expectedChallenge: pending.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      requireUserVerification: true,
    });
    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('No se pudo verificar la Passkey.');
    }

    const info = verification.registrationInfo;
    const credentialId = Buffer.from(info.credentialID).toString('base64url');
    const transports = dto.registrationResponse.response.transports ?? [];
    const user = await this.prisma.$transaction(async (transaction) => {
      const persistedUser = await transaction.user.upsert({
        where: { email },
        create: {
          id: pending.userId,
          email,
          displayName: pending.displayName,
        },
        update: { displayName: pending.displayName },
      });
      await transaction.passkeyCredential.upsert({
        where: { credentialId },
        create: {
          credentialId,
          userId: persistedUser.id,
          publicKey: Buffer.from(info.credentialPublicKey),
          counter: BigInt(info.counter),
          deviceType: info.credentialDeviceType,
          backedUp: info.credentialBackedUp,
          transports,
        },
        update: {
          publicKey: Buffer.from(info.credentialPublicKey),
          counter: BigInt(info.counter),
          deviceType: info.credentialDeviceType,
          backedUp: info.credentialBackedUp,
          transports,
          lastUsedAt: new Date(),
        },
      });
      return persistedUser;
    });

    await this.startSession(reply, user.id);
    return { user: this.toUser(user) };
  }

  async authenticationOptions(dto: LoginOptionsDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { passkeys: true },
    });
    if (!user || user.passkeys.length === 0) {
      throw new UnauthorizedException('No existe una Passkey para ese correo.');
    }

    const options = await generateAuthenticationOptions({
      rpID: this.rpId,
      userVerification: 'preferred',
      allowCredentials: user.passkeys.map((credential) => ({
        id: Buffer.from(credential.credentialId, 'base64url'),
        type: 'public-key',
        transports: credential.transports as never[],
      })),
    });
    const pending: PendingAuthentication = { challenge: options.challenge, userId: user.id };
    await this.redis.set(
      `webauthn:login:${email}`,
      JSON.stringify(pending),
      CHALLENGE_TTL_SECONDS,
    );
    return options;
  }

  async verifyAuthentication(dto: VerifyLoginDto, reply: FastifyReply) {
    const email = dto.email.trim().toLowerCase();
    const rawPending = await this.redis.getAndDelete(`webauthn:login:${email}`);
    if (!rawPending) throw new BadRequestException('El desafío de acceso expiró.');
    const pending = JSON.parse(rawPending) as PendingAuthentication;
    const credential = await this.prisma.passkeyCredential.findUnique({
      where: { credentialId: dto.authenticationResponse.id },
      include: { user: true },
    });
    if (!credential || credential.userId !== pending.userId) {
      throw new UnauthorizedException('La credencial no pertenece a esta cuenta.');
    }

    const verification = await verifyAuthenticationResponse({
      response: dto.authenticationResponse,
      expectedChallenge: pending.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      requireUserVerification: true,
      authenticator: {
        credentialID: Buffer.from(credential.credentialId, 'base64url'),
        credentialPublicKey: new Uint8Array(credential.publicKey),
        counter: Number(credential.counter),
        transports: credential.transports as never[],
      },
    });
    if (!verification.verified) throw new UnauthorizedException('La firma de la Passkey no es válida.');

    await this.prisma.passkeyCredential.update({
      where: { credentialId: credential.credentialId },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        backedUp: verification.authenticationInfo.credentialBackedUp,
        deviceType: verification.authenticationInfo.credentialDeviceType,
        lastUsedAt: new Date(),
      },
    });
    await this.startSession(reply, credential.userId);
    return { user: this.toUser(credential.user) };
  }

  async logout(sessionToken: string, reply: FastifyReply) {
    await this.redis.delete(`session:${sessionToken}`);
    reply.clearCookie('session_token', { path: '/' });
    return { success: true };
  }

  private async startSession(reply: FastifyReply, userId: string) {
    const token = randomBytes(32).toString('base64url');
    await this.redis.set(`session:${token}`, userId, this.sessionTtlSeconds);
    reply.setCookie('session_token', token, {
      path: '/',
      httpOnly: true,
      secure: this.origin.startsWith('https://'),
      sameSite: 'strict',
      signed: true,
      maxAge: this.sessionTtlSeconds,
    });
  }

  private toUser(user: {
    id: string;
    email: string | null;
    displayName: string;
    hasCompletedDiagnostic: boolean;
  }): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      hasCompletedDiagnostic: user.hasCompletedDiagnostic,
    };
  }
}
