CREATE TABLE "UserSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "voiceType" TEXT NOT NULL DEFAULT 'natural',
  "speechRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "speechVolume" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "autoSpeak" BOOLEAN NOT NULL DEFAULT true,
  "hapticFeedback" BOOLEAN NOT NULL DEFAULT true,
  "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "darkMode" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

ALTER TABLE "UserSettings"
ADD CONSTRAINT "UserSettings_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
