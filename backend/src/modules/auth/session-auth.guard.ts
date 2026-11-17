import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { AuthenticatedRequest } from './auth.types';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const signedCookie = request.cookies?.session_token;
    if (!signedCookie) throw new UnauthorizedException('Debes iniciar sesión.');

    const unsigned = request.unsignCookie(signedCookie);
    if (!unsigned.valid || !unsigned.value) {
      throw new UnauthorizedException('La sesión no es válida.');
    }

    const userId = await this.redis.get(`session:${unsigned.value}`);
    if (!userId) throw new UnauthorizedException('La sesión expiró.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('La cuenta ya no existe.');

    request.sessionToken = unsigned.value;
    request.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      hasCompletedDiagnostic: user.hasCompletedDiagnostic,
    };
    return true;
  }
}
