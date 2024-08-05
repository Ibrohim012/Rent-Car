import { Controller, Post, Body, Query } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { EmailVerificationService } from './email-verification.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class EmailVerificationController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const { user, token } = await this.authService.register(createUserDto);
    const verificationToken = await this.emailVerificationService.generateVerificationToken(user.id);
    await this.emailVerificationService.sendVerificationEmail(user.email, verificationToken);
    return { user, token };
  }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    await this.emailVerificationService.verifyEmail(token);
    return { message: 'Email confirmed successfully' };
  }
}
