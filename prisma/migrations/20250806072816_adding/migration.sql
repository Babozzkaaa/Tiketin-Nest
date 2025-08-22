/*
  Warnings:

  - You are about to drop the column `ticket_id` on the `payments` table. All the data in the column will be lost.
  - Added the required column `booking_reference` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `booking_reference` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_ticket_id_fkey";

-- DropIndex
DROP INDEX "payments_ticket_id_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "ticket_id",
ADD COLUMN     "booking_reference" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "booking_reference" VARCHAR(100) NOT NULL;
