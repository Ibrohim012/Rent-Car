/*
  Warnings:

  - The `emailVerificationTokenExpires` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "emailVerificationTokenExpires",
ADD COLUMN     "emailVerificationTokenExpires" TIMESTAMP(3);
