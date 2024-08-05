import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  full_name: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  avatar?: string;

  @IsEnum(Role)
  role: Role;
}
