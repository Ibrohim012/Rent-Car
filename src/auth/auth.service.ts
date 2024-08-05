import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { TokenPayload } from './interface/token-payload.interface';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from 'src/user/dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User } from '../user/entities/user.entity';
import { Role } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private emailService: EmailService
  ) {}

  async register(registerDto: RegisterDto, role: Role = Role.User) {
    const { email, password, full_name, phone, avatar } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const existingPhone = await this.prisma.user.findFirst({ where: { phone } });
    if (existingPhone) {
      throw new Error('Phone number already in use');
    }

    const verificationToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        full_name,
        avatar,
        role,
        password: hashedPassword,
        emailVerified: false,
        emailVerifiedToken: verificationToken,
        emailVerifiedExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        created_at: new Date(),
        last_edited_at: new Date(),
        isActive: false,
      },
    });

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    const verificationUrl = `http://localhost:3000/auth/verify?token=${verificationToken}`;
    await this.emailService.sendVerificationEmail(email, verificationUrl);

    return {
      user,
      token,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<void> {
    const { email, token } = verifyOtpDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { emailVerifications: true }
    });

    if (!user || user.emailVerifiedToken !== token) {
      throw new BadRequestException('Invalid token or email');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        emailVerifiedToken: null,
        emailVerifiedExpiresAt: null,
      },
    });
  }

  async login(userId: string) {
    const payload: TokenPayload = { userId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.token.create({
      data: {
        userId,
        token: refreshToken,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const accessToken = this.jwtService.sign({ userId: payload.userId }, { expiresIn: '15m' });

    return { accessToken, refreshToken };
  }

  async revokeToken(refreshToken: string) {
    await this.prisma.token.delete({ where: { token: refreshToken } });
    return { message: 'Token revoked successfully' };
  }

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    throw new UnauthorizedException();
  }

  async getProfile(userId: string) {
    return this.userService.findOne(userId);
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user && await bcrypt.compare(oldPassword, user.password)) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: newHashedPassword },
      });
      return { message: 'Password updated successfully' };
    }
    throw new BadRequestException('Old password is incorrect');
  }
}
