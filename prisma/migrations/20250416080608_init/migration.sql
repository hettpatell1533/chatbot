/*
  Warnings:

  - You are about to drop the column `description` on the `project` table. All the data in the column will be lost.
  - Added the required column `github_url` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "description",
ADD COLUMN     "github_url" TEXT NOT NULL;
