-- CreateTable
CREATE TABLE "chat_session" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_session_user_id_idx" ON "chat_session"("user_id");
