// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../config/prisma.service';
// import { CreateUserDto} from './dto/create-user.dto';
// import {UpdateUserDto } from './dto/update-user.dto'


// @Injectable()
// export class UserService {
//   constructor(private readonly prisma: PrismaService) {}

//   create(createUserDto: CreateUserDto) {
//     return this.prisma.user.create({
//       data: createUserDto,
//     });
//   }

//   findAll() {
//     return this.prisma.user.findMany();
//   }

//   findOne(id: string) {
//     return this.prisma.user.findUnique({
//       where: { id },
//     });
//   }

//   update(id: string, updateUserDto: UpdateUserDto) {
//     return this.prisma.user.update({
//       where: { id },
//       data: updateUserDto,
//     });
//   }

//   remove(id: string) {
//     return this.prisma.user.delete({
//       where: { id },
//     });
//   }
// }

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService,
             private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, phone, full_name, avatar, role, password } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        full_name,
        avatar,
        role,
        password: hashedPassword,
      },
    });

    const verificationUrl = `http://localhost:3000/auth/verify?token=${user.emailVerifiedToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: './verification', // Template nomini to'g'ri ko'rsating
      context: { // Template konteksti
        verificationUrl,
      },
    });

    return user;

  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async findAll(requestedRole?: Role) {
    if (requestedRole && ![Role.Admin, Role.Owner].includes(requestedRole)) {
      throw new ForbiddenException('You do not have permission to view all users.');
    }
    return this.prisma.user.findMany();
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateVerificationStatus(email: string, isVerified: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: isVerified },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
