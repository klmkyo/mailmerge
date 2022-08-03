/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `GmailSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GmailSettings_userId_key" ON "GmailSettings"("userId");
