-- CreateTable
CREATE TABLE "github_repo" (
    "id" TEXT NOT NULL,
    "source_code" TEXT NOT NULL,
    "embedding" INTEGER[],
    "file_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_repo_pkey" PRIMARY KEY ("id")
);
