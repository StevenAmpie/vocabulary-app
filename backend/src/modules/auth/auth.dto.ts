import { IsEmail, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/types';

export class RegisterOptionsDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName: string;
}

export class VerifyRegistrationDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsObject()
  registrationResponse: RegistrationResponseJSON;
}

export class LoginOptionsDto {
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class VerifyLoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsObject()
  authenticationResponse: AuthenticationResponseJSON;
}
