import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `http://localhost:3000/auth/verify?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Account Verification',
      text: `Please verify your account by clicking the following link: ${verificationUrl}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }): Promise<void> {
    const { to, subject, template, context } = options;
    const html = `<p>Click <a href="${context.verificationUrl}">here</a> to verify your email.</p>`;
    
    await this.transporter.sendMail({
      from: 'officialbegzodbek@gmail.com',
      to,
      subject,
      html,
    });
  }
}


// import { Injectable } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class EmailService {
//   private transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: 'officialbegzodbek@gmail.com',
//         pass: 'zfyh ktnc klph lzpj',
//       },
//     });
//   }

//   async sendMail(options: {
//     to: string;
//     subject: string;
//     template: string;
//     context: any;
//   }): Promise<void> {
//     const { to, subject, template, context } = options;
//     const html = `<p>Click <a href="${context.verificationUrl}">here</a> to verify your email.</p>`;
    
//     await this.transporter.sendMail({
//       from: 'officialbegzodbek@gmail.com',
//       to,
//       subject,
//       html,
//     });
//   }


//   async sendVerificationEmail(to: string, token: string) {
//     const verificationLink = `http://localhost:3000/auth/verify?token=${token}`;
//     const mailOptions = {
//       from: 'officialbegzodbek@gmail.com',
//       to,
//       subject: 'Verify your email',
//       text: `Please verify your email by clicking on the following link: ${verificationLink}`,
//     };

//     await this.transporter.sendMail(mailOptions);
//   }
// }
