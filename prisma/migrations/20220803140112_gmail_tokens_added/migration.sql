-- CreateTable
CREATE TABLE "GmailSettings" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GmailSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GmailSettings" ADD CONSTRAINT "GmailSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
