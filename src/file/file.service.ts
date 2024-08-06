import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  create(createFileDto: CreateFileDto) {
    return this.prisma.file.create({
      data: createFileDto,
    });
  }

  findAll() {
    return this.prisma.file.findMany();
  }

  findOne(id: string) {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }

  remove(id: string) {
    return this.prisma.file.delete({
      where: { id },
    });
  }
}
