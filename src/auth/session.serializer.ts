import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: Function): void {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: Function): Promise<void> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
