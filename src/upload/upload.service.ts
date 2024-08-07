// upload.service.ts
import { Injectable } from '@nestjs/common';
import {MulterModuleOptions } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class UploadService {
  getMulterConfig(): MulterOptions {
    return {
      storage: multer.diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + '-' + Date.now();
          const extension: string = path.parse(file.originalname).ext;
          callback(null, `${filename}${extension}`);
        },
      }),
    };
  }
}