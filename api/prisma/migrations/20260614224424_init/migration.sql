-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "qna_cache" (
    "id" SERIAL NOT NULL,
    "source_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "section" TEXT,
    "embedding" vector(768),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qna_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "qna_cache_source_version_idx" ON "qna_cache"("source_id", "version", "status");
