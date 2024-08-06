import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, IsString, IsPhoneNumber, IsDateString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  full_name: string;

  @IsPhoneNumber(null)
  phone: string;

  @IsOptional()
  avatar?: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  emailVerificationToken?: string;

  @IsOptional()
  @IsDateString()
  emailVerificationTokenExpires?: string;
}
