/*
  Warnings:

  - A unique constraint covering the columns `[project_id]` on the table `github_repo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `project_id` to the `github_repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "github_repo" ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_dependency_graph" (
    "id" TEXT NOT NULL,
    "graph" JSONB NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_dependency_graph_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "code_dependency_graph_project_id_key" ON "code_dependency_graph"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repo_project_id_key" ON "github_repo"("project_id");

-- AddForeignKey
ALTER TABLE "github_repo" ADD CONSTRAINT "github_repo_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_dependency_graph" ADD CONSTRAINT "code_dependency_graph_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
