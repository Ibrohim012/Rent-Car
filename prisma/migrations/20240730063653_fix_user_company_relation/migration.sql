/*
  Warnings:

  - A unique constraint covering the columns `[owner]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Company_owner_key" ON "Company"("owner");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
