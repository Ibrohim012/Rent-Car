import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModelDto } from './dto/create-model.dto';
import {UpdateModelDto} from './dto/update-model.dto';

@Injectable()
export class ModelService {
  constructor(private readonly prisma: PrismaService) {}

  create(createModelDto: CreateModelDto) {
    return this.prisma.model.create({
      data: createModelDto,
    });
  }

  findAll() {
    return this.prisma.model.findMany();
  }

  findOne(id: string) {
    return this.prisma.model.findUnique({
      where: { id },
    });
  }

  update(id: string, updateModelDto: UpdateModelDto) {
    return this.prisma.model.update({
      where: { id },
      data: updateModelDto,
    });
  }

  remove(id: string) {
    return this.prisma.model.delete({
      where: { id },
    });
  }
}
