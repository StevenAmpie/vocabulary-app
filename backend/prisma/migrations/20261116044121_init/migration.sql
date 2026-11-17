-- CreateEnum
CREATE TYPE "WordState" AS ENUM ('DISCOVERED', 'CONSOLIDATING', 'MASTERED');

-- CreateEnum
CREATE TYPE "EnglishLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "display_name" TEXT NOT NULL,
    "estimated_level" "EnglishLevel" DEFAULT 'A1',
    "has_completed_diagnostic" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey_credentials" (
    "credential_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "public_key" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "device_type" TEXT,
    "backed_up" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passkey_credentials_pkey" PRIMARY KEY ("credential_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "words" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "term_en" TEXT NOT NULL,
    "translation_es" TEXT NOT NULL,
    "phonetic_ipa" TEXT NOT NULL,
    "audio_url" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "category_slug" TEXT NOT NULL,
    "difficulty_score" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentences" (
    "id" TEXT NOT NULL,
    "sentence_en" TEXT NOT NULL,
    "translation_es" TEXT NOT NULL,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentence_words" (
    "sentence_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "is_target_word" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sentence_words_pkey" PRIMARY KEY ("sentence_id","word_id")
);

-- CreateTable
CREATE TABLE "user_word_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "state" "WordState" NOT NULL DEFAULT 'DISCOVERED',
    "direct_success_count" INTEGER NOT NULL DEFAULT 0,
    "context_success_count" INTEGER NOT NULL DEFAULT 0,
    "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_practiced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discovered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_word_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_streak_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_date" DATE NOT NULL,
    "words_practiced_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_streak_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge_icon_url" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "user_id" TEXT NOT NULL,
    "achievement_code" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id","achievement_code")
);

-- CreateTable
CREATE TABLE "weekly_recaps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_start" DATE NOT NULL,
    "week_end" DATE NOT NULL,
    "summary_data" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_recaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_attempts" (
    "id" TEXT NOT NULL,
    "client_attempt_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "selected_option_id" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "previous_state" "WordState",
    "resulting_state" "WordState",
    "result_payload" JSONB NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "passkey_credentials_user_id_idx" ON "passkey_credentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "words_slug_key" ON "words"("slug");

-- CreateIndex
CREATE INDEX "words_category_slug_idx" ON "words"("category_slug");

-- CreateIndex
CREATE INDEX "sentence_words_word_id_idx" ON "sentence_words"("word_id");

-- CreateIndex
CREATE INDEX "user_word_progress_user_id_next_review_at_idx" ON "user_word_progress"("user_id", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_word_progress_user_id_word_id_key" ON "user_word_progress"("user_id", "word_id");

-- CreateIndex
CREATE INDEX "user_streak_logs_user_id_idx" ON "user_streak_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_streak_logs_user_id_activity_date_key" ON "user_streak_logs"("user_id", "activity_date");

-- CreateIndex
CREATE INDEX "weekly_recaps_user_id_week_start_idx" ON "weekly_recaps"("user_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "learning_attempts_client_attempt_id_key" ON "learning_attempts"("client_attempt_id");

-- CreateIndex
CREATE INDEX "learning_attempts_user_id_attempted_at_idx" ON "learning_attempts"("user_id", "attempted_at");

-- CreateIndex
CREATE INDEX "learning_attempts_user_id_word_id_idx" ON "learning_attempts"("user_id", "word_id");

-- AddForeignKey
ALTER TABLE "passkey_credentials" ADD CONSTRAINT "passkey_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_category_slug_fkey" FOREIGN KEY ("category_slug") REFERENCES "categories"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_words" ADD CONSTRAINT "sentence_words_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_words" ADD CONSTRAINT "sentence_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word_progress" ADD CONSTRAINT "user_word_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word_progress" ADD CONSTRAINT "user_word_progress_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_streak_logs" ADD CONSTRAINT "user_streak_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_code_fkey" FOREIGN KEY ("achievement_code") REFERENCES "achievements"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_recaps" ADD CONSTRAINT "weekly_recaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_attempts" ADD CONSTRAINT "learning_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_attempts" ADD CONSTRAINT "learning_attempts_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
