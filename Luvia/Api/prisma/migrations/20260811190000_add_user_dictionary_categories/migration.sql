CREATE TYPE "DictionaryCategorySource" AS ENUM ('SYSTEM', 'USER');

ALTER TABLE "DictionaryCategory"
ADD COLUMN "normalizedName" TEXT,
ADD COLUMN "ownerId" TEXT,
ADD COLUMN "source" "DictionaryCategorySource" NOT NULL DEFAULT 'SYSTEM';

UPDATE "DictionaryCategory"
SET "normalizedName" = regexp_replace(
  translate(
    lower(btrim("name")),
    'áàâãäéèêëíìîïóòôõöúùûüçñ',
    'aaaaaeeeeiiiiooooouuuucn'
  ),
  '\s+',
  ' ',
  'g'
);

ALTER TABLE "DictionaryCategory"
ALTER COLUMN "normalizedName" SET NOT NULL;

CREATE UNIQUE INDEX "DictionaryCategory_ownerId_normalizedName_key"
ON "DictionaryCategory"("ownerId", "normalizedName");

CREATE UNIQUE INDEX "DictionaryCategory_normalizedName_system_key"
ON "DictionaryCategory"("normalizedName")
WHERE "ownerId" IS NULL;

CREATE INDEX "DictionaryCategory_ownerId_idx"
ON "DictionaryCategory"("ownerId");

ALTER TABLE "DictionaryCategory"
ADD CONSTRAINT "DictionaryCategory_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
