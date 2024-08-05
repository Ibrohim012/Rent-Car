-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedExpiresAt" TIMESTAMP(3),
ADD COLUMN     "emailVerifiedToken" TEXT;
