UPDATE "DictionarySign"
SET "isPublic" = false
WHERE "source" = 'USER'
  AND "isPublic" = true;
