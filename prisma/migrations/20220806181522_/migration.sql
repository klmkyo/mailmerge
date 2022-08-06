/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "sentTo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");
