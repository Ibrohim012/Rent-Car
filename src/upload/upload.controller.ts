import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import multer from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { storage: multer.diskStorage({ destination: './uploads' }) }))
  uploadFile(@UploadedFile() file) {
    return { url: `/uploads/${file.filename}` };
  }
}
