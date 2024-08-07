import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './session.serializer';
import { EmailService } from 'src/email/email.service';
import { UserModule } from 'src/user/user.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ConfigModule
  ],
  providers: [
    AuthService, 
    LocalStrategy, 
    JwtStrategy, 
    PrismaService, 
    EmailService, 
    SessionSerializer, 
    RolesGuard,
    JwtAuthGuard,
    LocalAuthGuard
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, LocalAuthGuard, RolesGuard, PassportModule],
})
export class AuthModule {}
