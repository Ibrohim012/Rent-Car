import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsStrongPassword } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  full_name: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional() // Agar bu maydon majburiy bo'lmasa
  avatar?: string;
}
