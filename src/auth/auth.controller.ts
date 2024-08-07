import { Controller, Post, Body, Request, UseGuards, Get, Query, ConflictException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { Admin } from 'typeorm';
import { Roles } from 'src/common/decorators/roles.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(@Body() body) {
    const { email, oldPassword, newPassword, confirmNewPassword } = body;
    return this.authService.resetPassword(email, oldPassword, newPassword, confirmNewPassword);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body) {
    const { email } = body;
    return this.authService.forgotPassword(email);
  }

  @Post('verifypass')
  async verifyPassword(@Body() body, @Query() param){
    const { password, newPassword} = body
    const {token} = param
    console.log(token)
    return this.authService.confirmPassword(token, password, newPassword);
  }

  // @Post('verify-email')
  // async verifyEmail(@Query('token') token: string, @Query('id') id: string) {
  //   return this.authService.verifyEmail(token, id);
  // }

@Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    const { token, email } = verifyEmailDto;
    await this.authService.verifyEmail(token, email);
    return { message: 'Email verified successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('renew-tokens')
  async renewTokens(@Request() req) {
    return this.authService.renewTokens(req.user);
  }
}
