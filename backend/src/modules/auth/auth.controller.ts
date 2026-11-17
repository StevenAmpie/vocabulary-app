import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import {
  LoginOptionsDto,
  RegisterOptionsDto,
  VerifyLoginDto,
  VerifyRegistrationDto,
} from './auth.dto';
import { AuthenticatedRequest } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('passkey/register-options')
  registrationOptions(@Body() body: RegisterOptionsDto) {
    return this.authService.registrationOptions(body);
  }

  @Public()
  @Post('passkey/verify-registration')
  verifyRegistration(@Body() body: VerifyRegistrationDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.authService.verifyRegistration(body, reply);
  }

  @Public()
  @Post('passkey/login-options')
  authenticationOptions(@Body() body: LoginOptionsDto) {
    return this.authService.authenticationOptions(body);
  }

  @Public()
  @Post('passkey/verify-login')
  verifyAuthentication(@Body() body: VerifyLoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.authService.verifyAuthentication(body, reply);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedRequest['user']) {
    return { user };
  }

  @Post('logout')
  logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.authService.logout(request.sessionToken, reply);
  }
}
