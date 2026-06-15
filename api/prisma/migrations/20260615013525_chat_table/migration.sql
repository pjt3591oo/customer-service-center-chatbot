-- CreateEnum
CREATE TYPE "ChatMode" AS ENUM ('agent', 'real-time');

-- CreateEnum
CREATE TYPE "MessageFrom" AS ENUM ('user', 'bot', 'system', 'admin');

-- CreateTable
CREATE TABLE "chat" (
    "id" UUID NOT NULL,
    "chat_session_id" TEXT NOT NULL,
    "from" "MessageFrom" NOT NULL,
    "content" TEXT NOT NULL,
    "mode" "ChatMode" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_session_id_idx" ON "chat"("chat_session_id");
