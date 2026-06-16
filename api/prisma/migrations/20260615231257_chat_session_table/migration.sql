/*
  Warnings:

  - You are about to drop the column `user_id` on the `chat_session` table. All the data in the column will be lost.
  - Added the required column `chat_session_id` to the `chat_session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "chat_session_user_id_idx";

-- AlterTable
ALTER TABLE "chat_session" DROP COLUMN "user_id",
ADD COLUMN     "chat_session_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "chat_session_chat_session_id_idx" ON "chat_session"("chat_session_id");
