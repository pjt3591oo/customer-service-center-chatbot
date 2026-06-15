/*
  Warnings:

  - The values [agent,real-time] on the enum `ChatMode` will be removed. If these variants are still used in the database, this will fail.
  - The values [user,bot,system,admin] on the enum `MessageFrom` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChatMode_new" AS ENUM ('AGENT', 'REALTIME');
ALTER TABLE "chat" ALTER COLUMN "mode" TYPE "ChatMode_new" USING ("mode"::text::"ChatMode_new");
ALTER TYPE "ChatMode" RENAME TO "ChatMode_old";
ALTER TYPE "ChatMode_new" RENAME TO "ChatMode";
DROP TYPE "public"."ChatMode_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MessageFrom_new" AS ENUM ('USER', 'BOT', 'SYSTEM', 'ADMIN');
ALTER TABLE "chat" ALTER COLUMN "from" TYPE "MessageFrom_new" USING ("from"::text::"MessageFrom_new");
ALTER TYPE "MessageFrom" RENAME TO "MessageFrom_old";
ALTER TYPE "MessageFrom_new" RENAME TO "MessageFrom";
DROP TYPE "public"."MessageFrom_old";
COMMIT;
