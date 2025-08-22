/*
  Warnings:

  - Added the required column `amount` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "payment_url" VARCHAR(500),
ADD COLUMN     "xendit_invoice_id" VARCHAR(100),
ADD COLUMN     "xendit_payment_id" VARCHAR(100);
