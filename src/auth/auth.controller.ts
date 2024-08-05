import { Controller, Post, Body, UseGuards, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { User as UserEntity } from '../user/entities/user.entity';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { User } from '../common/decorators/user.decorator';
import { PrismaService } from 'src/config/prisma.service';
import { VerifyOtpDto } from 'src/user/dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const { user, token } = await this.authService.register(createUserDto);
    const verificationToken = await this.emailVerificationService.generateVerificationToken(user.id);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedToken: verificationToken,
        emailVerifiedExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    await this.emailVerificationService.sendVerificationEmail(user.email, verificationToken);
    return { user, token };
  }

  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user.id);
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
    @User() user: UserEntity,
  ) {
    return this.authService.updatePassword(user.id, oldPassword, newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@User() user: UserEntity) {
    return this.authService.getProfile(user.id);
  }

  @Post('refresh-token')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('revoke-token')
  async revoke(@Body('refreshToken') refreshToken: string) {
    return this.authService.revokeToken(refreshToken);
  }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifiedToken: token,
        emailVerifiedExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedToken: null,
        emailVerifiedExpiresAt: null,
      },
    });

    return { message: 'Email confirmed successfully' };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }
}

// AdminController
@Controller('admin')
export class AdminController {
  @Get()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminData() {
    return 'This route is only accessible by admins';
  }
}
