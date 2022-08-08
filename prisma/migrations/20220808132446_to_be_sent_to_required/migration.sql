/*
  Warnings:

  - Made the column `toBeSentTo` on table `Email` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable


-- copy toBeSentTo from contact.email to beSentTo
UPDATE "Email" SET "toBeSentTo" = "email" FROM "Contact" WHERE "Email"."contactId" = "Contact"."id";
ALTER TABLE "Email" ALTER COLUMN "toBeSentTo" SET NOT NULL;
