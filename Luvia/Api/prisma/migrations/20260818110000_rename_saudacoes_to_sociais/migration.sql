DO $$
DECLARE
  canonical_category_id TEXT;
BEGIN
  SELECT "id"
  INTO canonical_category_id
  FROM "DictionaryCategory"
  WHERE "ownerId" IS NULL
    AND (
      "slug" IN ('saudacoes', 'sociais')
      OR "name" IN ('Saudações', 'Sociais')
      OR "normalizedName" IN ('saudacoes', 'sociais')
      OR "iconKey" IN ('SAUDACOES', 'SOCIAIS')
    )
  ORDER BY
    CASE
      WHEN "slug" = 'saudacoes' THEN 0
      WHEN "name" = 'Saudações' THEN 1
      WHEN "slug" = 'sociais' THEN 2
      WHEN "name" = 'Sociais' THEN 3
      ELSE 4
    END,
    "createdAt" ASC
  LIMIT 1;

  IF canonical_category_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE "DictionaryCategory"
  SET "slug" = CONCAT('sociais-conflito-', SUBSTRING("id"::TEXT, 1, 8))
  WHERE "slug" = 'sociais'
    AND "id" <> canonical_category_id;

  UPDATE "DictionarySign"
  SET "categoryId" = canonical_category_id
  WHERE "categoryId" IN (
    SELECT "id"
    FROM "DictionaryCategory"
    WHERE "ownerId" IS NULL
      AND "id" <> canonical_category_id
      AND (
        "slug" IN ('saudacoes', 'sociais')
        OR "name" IN ('Saudações', 'Sociais')
        OR "normalizedName" IN ('saudacoes', 'sociais')
        OR "iconKey" IN ('SAUDACOES', 'SOCIAIS')
      )
  );

  DELETE FROM "DictionaryCategory"
  WHERE "ownerId" IS NULL
    AND "id" <> canonical_category_id
    AND (
      "slug" IN ('saudacoes', 'sociais')
      OR "name" IN ('Saudações', 'Sociais')
      OR "normalizedName" IN ('saudacoes', 'sociais')
      OR "iconKey" IN ('SAUDACOES', 'SOCIAIS')
    );

  UPDATE "DictionaryCategory"
  SET "name" = 'Sociais',
      "slug" = 'sociais',
      "normalizedName" = 'sociais',
      "iconKey" = 'SOCIAIS',
      "description" = 'Interações sociais, cumprimentos e expressões comuns.',
      "source" = 'SYSTEM',
      "ownerId" = NULL
  WHERE "id" = canonical_category_id;
END $$;
