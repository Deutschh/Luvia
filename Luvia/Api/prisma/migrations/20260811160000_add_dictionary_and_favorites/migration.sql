-- CreateEnum
CREATE TYPE "SignSource" AS ENUM ('SYSTEM', 'USER', 'MOCK', 'IOT');

-- CreateTable
CREATE TABLE "DictionaryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DictionaryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionarySign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "example" TEXT,
    "categoryId" TEXT NOT NULL,
    "ownerId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "source" "SignSource" NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DictionarySign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteSign" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteSign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryCategory_slug_key" ON "DictionaryCategory"("slug");

-- CreateIndex
CREATE INDEX "DictionarySign_categoryId_idx" ON "DictionarySign"("categoryId");

-- CreateIndex
CREATE INDEX "DictionarySign_ownerId_idx" ON "DictionarySign"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteSign_userId_signId_key" ON "FavoriteSign"("userId", "signId");

-- CreateIndex
CREATE INDEX "FavoriteSign_userId_idx" ON "FavoriteSign"("userId");

-- CreateIndex
CREATE INDEX "FavoriteSign_signId_idx" ON "FavoriteSign"("signId");

-- AddForeignKey
ALTER TABLE "DictionarySign" ADD CONSTRAINT "DictionarySign_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DictionaryCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictionarySign" ADD CONSTRAINT "DictionarySign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSign" ADD CONSTRAINT "FavoriteSign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSign" ADD CONSTRAINT "FavoriteSign_signId_fkey" FOREIGN KEY ("signId") REFERENCES "DictionarySign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
