import { Role } from '@prisma/client';

export class User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  avatar?: string;
  role: Role;
  emailVerified: boolean;
  emailVerifiedToken?: string;
  emailVerifiedExpiresAt?: Date;
  created_at: Date;
  last_edited_at: Date;
  isActive: boolean;
}
