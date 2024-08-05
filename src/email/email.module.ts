import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}



// import { Module } from '@nestjs/common';
// import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { join } from 'path';
// import { EmailService } from './email.service';

// @Module({
//   imports: [
//     MailerModule.forRoot({
//       transport: {
//         host: 'smtp.your-email-provider.com', // replace with your SMTP server
//         port: 587,
//         auth: {
//           user: 'your-email@example.com', // replace with your email
//           pass: 'your-email-password', // replace with your email password
//         },
//       },
//       defaults: {
//         from: '"No Reply" <no-reply@example.com>',
//       },
//       template: {
//         dir: join(__dirname, '../templates'),
//         adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
//         options: {
//           strict: true,
//         },
//       },
//     }),
//   ],
//   providers: [EmailService],
//   exports: [EmailService],
// })
// export class EmailModule {}
