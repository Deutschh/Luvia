ALTER TABLE "DictionarySign"
ADD COLUMN "normalizedTitle" TEXT;

UPDATE "DictionarySign"
SET "normalizedTitle" = regexp_replace(lower(btrim("title")), '\s+', ' ', 'g');

ALTER TABLE "DictionarySign"
ALTER COLUMN "normalizedTitle" SET NOT NULL;

CREATE UNIQUE INDEX "DictionarySign_categoryId_ownerId_normalizedTitle_key"
ON "DictionarySign"("categoryId", "ownerId", "normalizedTitle");

CREATE UNIQUE INDEX "DictionarySign_categoryId_normalizedTitle_system_key"
ON "DictionarySign"("categoryId", "normalizedTitle")
WHERE "ownerId" IS NULL;
