/*
  Warnings:

  - You are about to drop the column `embedding` on the `github_repo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "github_repo" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "is_subscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscription" TEXT;
