/*
  Warnings:

  - Made the column `is_booked` on table `seats` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "seats" ALTER COLUMN "is_booked" SET NOT NULL,
ALTER COLUMN "is_booked" SET DEFAULT false;
