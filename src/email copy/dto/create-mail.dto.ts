import { IsString, IsEmail } from 'class-validator';

export class CreateMailDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;
}
