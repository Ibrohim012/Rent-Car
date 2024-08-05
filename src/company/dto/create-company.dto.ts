import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsOptional()
  logo?: string;
}
