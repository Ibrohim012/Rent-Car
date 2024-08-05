import { IsString } from 'class-validator';

export class UpdateMailDto {
  @IsString()
  email: string;

  @IsString()
  token: string;
}
