/*
  Warnings:

  - The `graph` column on the `code_dependency_graph` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "code_dependency_graph" DROP COLUMN "graph",
ADD COLUMN     "graph" JSONB[];
