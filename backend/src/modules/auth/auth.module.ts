import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from './session-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionAuthGuard,
    { provide: APP_GUARD, useExisting: SessionAuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
