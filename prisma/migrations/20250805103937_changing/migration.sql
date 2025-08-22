/*
  Warnings:

  - The `carriage_type` column on the `carriages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `price` on the `schedules` table. All the data in the column will be lost.
  - The `train_type` column on the `trains` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CarriageType" AS ENUM ('ECONOMY', 'BUSINESS', 'EXECUTIVE', 'FIRST_CLASS');

-- CreateEnum
CREATE TYPE "TrainType" AS ENUM ('PASSENGER', 'FREIGHT', 'HIGH_SPEED', 'CARGO', 'BULK', 'INTERCITY', 'HIGH_SPEED_CARGO', 'METRO');

-- AlterTable
ALTER TABLE "carriages" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
DROP COLUMN "carriage_type",
ADD COLUMN     "carriage_type" "CarriageType" NOT NULL DEFAULT 'ECONOMY';

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "trains" ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "train_type",
ADD COLUMN     "train_type" "TrainType" NOT NULL DEFAULT 'PASSENGER';
