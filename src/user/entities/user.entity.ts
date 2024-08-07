import { Role } from '@prisma/client';
import { Column } from 'typeorm';

export class User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  avatar?: string;
  role: Role;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  emailVerificationTokenExpires?: Date;

  created_at: Date;
  last_edited_at: Date;
  isActive: boolean;
}
