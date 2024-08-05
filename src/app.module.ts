import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { CarModule } from './car/car.module';
import { ModelModule } from './model/model.module';
import { TransactionModule } from './transaction/transaction.module';
import { FileModule } from './file/file.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PrismaService } from './config/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          // host: configService.get<string>('EMAIL_HOST'),
          service: "gmail",
          // port: configService.get<number>('EMAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
          // host: "sandbox.smtp.mailtrap.io",
          // port: 2525,
          // auth: {
          //   user: "fbe140f53c5e77",
          //   pass: "9611bfb33669b9"
          // }
        },
        defaults: {
          from: "No reply officialbegzodbek@gmail.com"
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CompanyModule,
    UserModule,
    CarModule,
    ModelModule,
    TransactionModule,
    FileModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  providers: [
    PrismaService,
  ],
})
export class AppModule {}
