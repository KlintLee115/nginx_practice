/*
  Warnings:

  - You are about to drop the `seats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `begin_datetime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_datetime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "seats" DROP CONSTRAINT "fk_event";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "begin_datetime" TIMESTAMPTZ(0) NOT NULL,
ADD COLUMN     "end_datetime" TIMESTAMPTZ(0) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL;

-- DropTable
DROP TABLE "seats";

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "reserved_until" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaserEmail" TEXT NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isBought" BOOLEAN NOT NULL DEFAULT false,
    "purchased_time" TIMESTAMPTZ(6),
    "buyerEmail" TEXT,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id","event_id")
);

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "fk_event" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "fk_seat" FOREIGN KEY ("seat_id", "event_id") REFERENCES "tickets"("id", "event_id") ON DELETE CASCADE ON UPDATE NO ACTION;
