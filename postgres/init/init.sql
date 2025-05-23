-- DB作成
CREATE DATABASE k_on_line;
-- 作成したDBに接続
\c k_on_line;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('GRADUATE', 'STUDENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Part') THEN
        CREATE TYPE "Part" AS ENUM (
            'VOCAL',
            'BACKING_GUITAR',
            'LEAD_GUITAR',
            'BASS',
            'DRUMS',
            'KEYBOARD',
            'OTHER'
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountRole') THEN
        CREATE TYPE "AccountRole" AS ENUM ('TOPADMIN', 'ADMIN', 'USER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BuyBookingStatus') THEN
        CREATE TYPE "BuyBookingStatus" AS ENUM ('UNPAID', 'PAID', 'CANCELED', 'EXPIRED');
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GachaRarity') THEN
        CREATE TYPE "BuyBookingStatus" AS ENUM (
          'COMMON',
          'RARE',
          'SUPER_RARE',
          'SS_RARE',
          'ULTRA_RARE'
          'SECRET_RARE'
          );
    END IF;
END$$;

-- Create Users table
CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "user_id" TEXT,
  "password" TEXT,
  "email" TEXT,
  "email_verified" TIMESTAMP,
  "image" TEXT,
  "role" "AccountRole" DEFAULT 'USER',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create Bookings table
CREATE TABLE "booking" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "booking_date" TEXT NOT NULL,
  "booking_time" INT NOT NULL,
  "regist_name" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "is_deleted" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE SET NULL
);

-- Create BanBooking table
CREATE TABLE "ex_booking" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "start_date" TEXT NOT NULL,
  "start_time" INT NOT NULL,
  "end_time" INT,
  "description" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "is_deleted" BOOLEAN DEFAULT FALSE
);

-- Create BuyBookings table
CREATE TABLE "buy_booking" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "booking_id" TEXT,
  "user_id" TEXT,
  "status" "BuyBookingStatus" DEFAULT 'UNPAID',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "expire_at" TIMESTAMP,
  "is_deleted" BOOLEAN DEFAULT FALSE,

  FOREIGN KEY ("booking_id") REFERENCES "booking" ("id") ON DELETE SET NULL,
  FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE SET NULL
);

-- Create Profiles table
CREATE TABLE "profile" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT,
  "name" TEXT,
  "student_id" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "expected" TEXT,
  "role" "Role",
  "part" "Part"[],
  "is_deleted" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE "user_gacha" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "gacha_version" TEXT NOT NULL,
  "gacha_rarity" "GachaRarity" NOT NULL,
  "gacha_src" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "is_deleted" BOOLEAN DEFAULT FALSE,

  FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

-- Create Accounts table
CREATE TABLE "account" (
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INT,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("provider", "provider_account_id"),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

-- Create Sessions table
CREATE TABLE "session" (
  "session_token" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

-- Create VerificationTokens table
CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- Create PadLocks table
CREATE TABLE "pad_lock" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "is_deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE "youtube_auth" (
  "google_id" TEXT PRIMARY KEY,
  "email" TEXT,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "token_expiry" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "is_deleted" BOOLEAN DEFAULT FALSE
);

CREATE TABLE "playlist" (
  "playlist_id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "link" TEXT NOT NULL,
  "live_date" TEXT NOT NULL,
  "tags" TEXT[] DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "video" (
  "video_id" TEXT PRIMARY KEY,
  "playlist_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "link" TEXT NOT NULL,
  "live_date" TEXT NOT NULL,
  "tags" TEXT[] DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("playlist_id") REFERENCES "playlist" ("playlist_id") ON DELETE CASCADE
)

CREATE TABLE "schedule" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP NOT NULL,
    "mention" TEXT,
    "time_extended" BOOLEAN NOT NULL DEFAULT FALSE,
    "deadline" TIMESTAMP NOT NULL,
    "description" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX "schedule_user_id_idx" ON "schedule" ("user_id");

CREATE TABLE "timeslot" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "date" TIMESTAMP NOT NULL,
    "time" INT NOT NULL,
    CONSTRAINT unique_timeslot UNIQUE ("date", "time")
);

CREATE TABLE "schedule_timeslot" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "schedule_id" UUID NOT NULL,
    "timeslot_id" UUID NOT NULL,
    CONSTRAINT unique_schedule_timeslot UNIQUE ("schedule_id", "timeslot_id"),
    FOREIGN KEY ("schedule_id") REFERENCES "schedule" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("timeslot_id") REFERENCES "timeslot" ("id") ON DELETE CASCADE
);

CREATE TABLE "user_schedule" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX "user_schedule_user_id_idx" ON "user_schedule" ("user_id");
CREATE INDEX "user_schedule_schedule_id_idx" ON "user_schedule" ("schedule_id");

CREATE TABLE "user_timeslot" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_schedule_id" UUID NOT NULL,
    "timeslot_id" UUID NOT NULL,
    CONSTRAINT unique_user_timeslot UNIQUE ("user_schedule_id", "timeslot_id"),
    FOREIGN KEY ("user_schedule_id") REFERENCES "user_schedule" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("timeslot_id") REFERENCES "timeslot" ("id") ON DELETE CASCADE
);

-- 外部キー制約
ALTER TABLE "schedule"
    ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "user_schedule"
    ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    ADD FOREIGN KEY ("schedule_id") REFERENCES "schedule" ("id") ON DELETE CASCADE;
