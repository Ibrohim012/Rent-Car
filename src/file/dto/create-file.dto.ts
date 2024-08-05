import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ description: 'URL of the file' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString() 
  mimetype: string;

  @ApiProperty({ description: 'Size of the file in bytes' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'Associated car ID', required: false })
  @IsOptional()
  @IsUUID()
  car_id: string;
}


// import { IsString, IsUUID, IsNumber } from 'class-validator';

// export class CreateFileDto {
//   @IsUUID()
//   car_id: string;

//   @IsString()
//   url: string;

//   @IsString()
//   mimetype: string;

//   @IsNumber()
//   size: number;
// }
