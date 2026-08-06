-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "googleId" TEXT,
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
