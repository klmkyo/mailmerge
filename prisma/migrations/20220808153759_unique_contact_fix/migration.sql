/*
  Warnings:

  - A unique constraint covering the columns `[email,userId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Contact_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_userId_key" ON "Contact"("email", "userId");
