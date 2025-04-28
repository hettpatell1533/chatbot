/*
  Warnings:

  - A unique constraint covering the columns `[customer_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_customer_id_key" ON "user"("customer_id");
