// import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UserService } from '../user/user.service';
// import { User } from 'src/user/entities/user.entity';
// import * as bcrypt from 'bcryptjs';
// import { CreateUserDto } from 'src/user/dto/create-user.dto';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { EmailService } from 'src/email/email.service';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private userService: UserService,
//     private jwtService: JwtService,
//     private emailService: EmailService,
//     private readonly configService: ConfigService,
//   ) { }

//   async validateUser(email: string, pass: string): Promise<any> {
//     const user = await this.userService.findByEmail(email);
//     if (user && await bcrypt.compare(pass, user.password)) {
//       const { password, ...result } = user;
//       return result;
//     }
//     return null;
//   }

//   async register(createUserDto: CreateUserDto) {
//     const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
//     const user = await this.prisma.user.create({
//       data: {
//         ...createUserDto,
//         password: hashedPassword,
//         isActive: true, // Ensure isActive is set to true
//       },
//     });
    
//     // Generate verification token
//     const token = await this.generateVerificationToken(user.email);

//     // Send verification email
//     await this.emailService.sendVerificationEmail(user.email, token);

//     return {
//       message: 'You have successfully signed up. Please check your email for verification instructions.',
//       full_name: user.full_name,
//       email: user.email,
//     };
//   }

//   async login(user: any) {
//     const payload = { full_name: user.full_name, sub: user.id };
//     return {
//       access_token: this.jwtService.sign(payload),
//       refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
//     };
//   }

//   async resetPassword(email: string, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<string> {
//     const user = await this.userService.findByEmail(email);
//     if (!user) {
//       throw new Error('User not found');
//     }
//     if (!(await bcrypt.compare(oldPassword, user.password))) {
//       throw new Error("Invalid Password");
//     }
//     if (newPassword !== confirmNewPassword) {
//       throw new Error("Passwords not matched.")
//     }
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await this.userService.updatePassword(user.id, hashedPassword);
//     return "Password updated"
//   }

//   async refresh(refreshToken: string) {
//     const payload = this.jwtService.verify(refreshToken);
//     const user = await this.userService.findOne(payload.sub);
//     return this.login(user);
//   }

//   async confirmPassword(token: string, password: string, newPassword: string): Promise<string> {
//     const { email } = this.jwtService.verify(token)
//     const existingEmail = await this.userService.findByEmail(email);
//     if (!existingEmail) {
//       throw new ConflictException("Email doesn't exists");
//     }
//     if (password !== newPassword){
//       throw new Error("Password didn't match try again")
//     }
//     await this.userService.confirmPassword(email, password)
//     return "Password updated"
//   }
  
//   async findUserById(id: string): Promise<User> {
//     return this.userService.findById(id);
//   }

//   async generateVerificationToken(email: string): Promise<string> {
//     const payload = { email };
//     const token = this.jwtService.sign(payload, { expiresIn: '1h' }); // Token expires in 1 hour
//     return token;
//   }

//   async forgotPassword(email: string): Promise<string> {
//     const user = await this.userService.findByEmail(email);
//     if (!user) {
//       throw new Error('User not found');
//     }
//     const token = this.jwtService.sign({ email }, { expiresIn: '10m' });
//     await this.emailService.sendVerificationEmail(user.email, token);
//     return token;
//   }

//   async verifyEmail(token: string, id: string): Promise<void> {
//     const user = await this.prisma.user.findUnique({ where: { id } });

//     if (!user || user.emailVerificationToken !== token) {
//       throw new UnauthorizedException('Invalid or expired verification token');
//     }

//     if (new Date(user.emailVerificationTokenExpires) < new Date()) {
//       throw new UnauthorizedException('Verification token has expired');
//     }

//     await this.prisma.user.update({
//       where: { id: user.id },
//       data: {
//         emailVerificationToken: null,
//         emailVerificationTokenExpires: null,
//         isActive: true,
//       },
//     });
//   }

//   async verifyAndConfirmEmail(token: string): Promise<string> {
//     try {
//       const payload = this.jwtService.verify(token, {
//         secret: this.configService.get<string>('JWT_SECRET'),
//       });

//       const user = await this.userService.findByEmail(payload.email);
//       if (!user) {
//         throw new ConflictException('User not found');
//       }
//       if (user.emailVerificationToken !== token) {
//         throw new ConflictException('Invalid or expired verification token');
//       }
//       if (new Date() > new Date(user.emailVerificationTokenExpires)) {
//         throw new ConflictException('Verification token expired');
//       }

//       await this.prisma.user.update({
//         where: { email: payload.email },
//         data: {
//           emailVerificationToken: null,
//           emailVerificationTokenExpires: null,
//           isActive: true, // Activate the user
//         },
//       });

//       return "Your account has been confirmed and activated.";
//     } catch (error) {
//       throw new UnauthorizedException('Invalid or expired verification token');
//     }
//   }

//   async verifyEmailToken(token: string): Promise<string | null> {
//     try {
//       const decoded = this.jwtService.verify(token, {
//         secret: this.configService.get<string>('JWT_SECRET'),
//       });
//       return decoded.email;
//     } catch (error) {
//       return null;
//     }
//   }

//   async renewTokens(user: any) {
//     const payload = { username: user.username, sub: user.userId };
//     return {
//       access_token: this.jwtService.sign(payload),
//       refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
//     };
//   }
// }


// src/auth/auth.service.ts
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
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
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        isActive: true, 
      },
    });


    const token = await this.generateVerificationToken(user.email);

  
    await this.emailService.sendVerificationEmail(user.email, token);

    return {
      message: 'You have successfully signed up. Please check your email for verification instructions.',
      full_name: user.full_name,
      email: user.email,
    };
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
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
    await this.userService.updatePassword(user.id, { newPassword: hashedPassword }); // Update here
    return "Password updated";
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.userService.findById(payload.sub);
    return this.login(user);
  }

  async confirmPassword(token: string, password: string, newPassword: string): Promise<string> {
    const { email } = this.jwtService.verify(token)
    const existingEmail = await this.userService.findByEmail(email);
    if (!existingEmail) {
      throw new ConflictException("Email doesn't exist");
    }
    if (password !== newPassword) {
      throw new Error("Password didn't match. Try again.");
    }
    await this.userService.confirmPassword(email, password);
    return "Password updated";
  }

  async findUserById(id: string): Promise<User> {
    return this.userService.findById(id);
  }

  async generateVerificationToken(email: string): Promise<string> {
    const payload = { email };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' }); 
    return token;
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const token = this.jwtService.sign({ email }, { expiresIn: '10m' });
    await this.emailService.sendVerificationEmail(user.email, token);
    return token;
  }

  async verifyEmail(token: string, email: string): Promise<void> {
    // Email orqali foydalanuvchini topamiz
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token or email');
    }

    if (user.emailVerificationToken !== token) {
      throw new UnauthorizedException('Invalid token or email');
    }

    if (new Date() > user.emailVerificationTokenExpires) {
      throw new UnauthorizedException('Verification token expired');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });
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
      const { email } = this.jwtService.verify(token);
      return email;
    } catch (error) {
      return null;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<string> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const passwordMatches = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatches) {
      throw new Error('Invalid old password');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(userId, { newPassword: hashedPassword });
    return 'Password updated successfully';
  }

  async renewTokens(user: any) {
    const payload = { full_name: user.full_name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.userService.findById(payload.sub);
    if (user) {
    }
  }
}
