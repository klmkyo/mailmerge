/*
  Warnings:

  - You are about to drop the column `createdAt` on the `EmailVisit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `EmailVisit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailVisit" RENAME COLUMN "createdAt" TO "visitedAt";
ALTER TABLE "EmailVisit" DROP COLUMN "updatedAt";
