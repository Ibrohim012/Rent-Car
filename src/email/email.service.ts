import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  async sendVerificationEmail(user: Partial<User> & { id: string; email: string; full_name: string }): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); 

    const expiresString = expires.toISOString();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: expiresString,
      },
    });

    const url = `http://localhost:3000/auth/verify-email?token=${token}&id=${user.id}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify Email',
      template: './verification',
      context: {
        name: user.full_name,
        url,
      },
    });
  }
}
