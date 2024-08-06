import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        emailVerificationToken: '',
        emailVerificationTokenExpires: new Date().toISOString(),
        isActive: false,
      },
    });

    const token = this.jwtService.sign(
      { email: user.email },
      { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '1h' },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: new Date(Date.now() + 3600000).toISOString(),
      },
    });

    await this.emailService.sendVerificationEmail({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    });

    return {
      message: 'You have successfully signed up. Please check your email for verification instructions.',
      full_name: user.full_name,
      email: user.email,
    };
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${token}`;
    // Adjusted or remove 'sendVerificationEmail' if the user ID is needed
    await this.emailService.sendVerificationEmail({
      id: '', // You may need to pass the user id or adjust logic here
      email,
      full_name: '', // Adjust or remove if not needed
    });
  }

  async login(user: any) {
    const payload = { full_name: user.full_name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
    };
  }

  async resetPassword(email: string, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new Error("Invalid Password");
    }
    if (newPassword !== confirmNewPassword) {
      throw new Error("Passwords not matched.")
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, hashedPassword);
    return "Password updated"
  }

  async confirmPassword(token: string, password: string, newPassword: string): Promise<string> {
    const { email } = this.jwtService.verify(token)
    const existingEmail = await this.userService.findByEmail(email);
    if (!existingEmail) {
      throw new ConflictException("Email doesn't exists");
    }
    if (password !== newPassword){
      throw new Error("Password didn't match try again")
    }
    await this.userService.confirmPassword(email, password)
    return "Password updated"
  }

  async generateVerificationToken(email: string): Promise<string> {
    const payload = { email };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    await this.userService.updateVerificationStatus(email, false);
    return token;
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const token = this.jwtService.sign({ email }, { expiresIn: '10m' });
    await this.emailService.sendVerificationEmail({
      id: '', // You may need to pass the user id or adjust logic here
      email,
      full_name: '', // Adjust or remove if not needed
    });
    return token;
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });
      const user = await this.userService.findByEmail(payload.email);

      if (user.emailVerificationTokenExpires < new Date().toISOString()) {
        throw new UnauthorizedException('Verification token has expired');
      }

      await this.userService.updateVerificationStatus(user.email, true);
      await this.userService.confirmEmail(user.id);

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async verifyAndConfirmEmail(token: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userService.findByEmail(payload.email);
      if (!user) {
        throw new ConflictException('User not found');
      }
      if (user.emailVerificationToken !== token) {
        throw new ConflictException('Invalid or expired verification token');
      }
      if (new Date() > new Date(user.emailVerificationTokenExpires)) {
        throw new ConflictException('Verification token expired');
      }

      await this.prisma.user.update({
        where: { email: payload.email },
        data: {
          emailVerificationToken: null,
          emailVerificationTokenExpires: null,
          isActive: true, // Activate the user
        },
      });

      return "Your account has been confirmed and activated.";
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async verifyEmailToken(token: string): Promise<string | null> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return decoded.email;
    } catch (error) {
      return null;
    }
  }

  async renewTokens(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
