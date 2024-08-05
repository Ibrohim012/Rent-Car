import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { PrismaService } from 'src/config/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [MailerModule],
  providers: [EmailVerificationService, PrismaService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
