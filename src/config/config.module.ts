import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class ConfigModule {}
