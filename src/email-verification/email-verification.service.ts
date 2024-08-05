import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async generateVerificationToken(userId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://yourdomain.com/api/auth/confirm-email?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: './verification',
      context: {
        verificationUrl,
      },
    });
  }

  async verifyEmail(token: string) {
    const emailVerification = await this.prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!emailVerification || emailVerification.expiresAt < new Date()) {
      throw new Error('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: emailVerification.userId },
      data: { emailVerified: true },
    });

    await this.prisma.emailVerification.delete({ where: { token } });
  }
}
