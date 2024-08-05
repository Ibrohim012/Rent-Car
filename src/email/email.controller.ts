// import { Controller, Post, Body, Param, Put, Delete, Get } from '@nestjs/common';
// import { EmailService } from './email.service';
// import { CreateMailDto } from './dto/create-mail.dto'; // DTO import qilish
// import { UpdateMailDto } from './dto/update-mail.dto'; // DTO import qilish

// @Controller('mail')
// export class MailController {
//   constructor(private readonly mailService: EmailService) {}

//   @Post('send-verification')
//   async sendVerificationEmail(@Body() createMailDto: CreateMailDto) {
//     return this.mailService.sendVerificationEmail(createMailDto.email, createMailDto.token);
//   }

//   @Post('send-password-reset')
//   async sendPasswordResetEmail(@Body() createMailDto: CreateMailDto) {
//     return this.mailService.sendPasswordResetEmail(createMailDto.email, createMailDto.token);
//   }
// }

import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  sendEmail(@Body() emailData: { to: string; subject: string; template: string; context: any }) {
    return this.emailService.sendMail(emailData);
  }
}


