/*
  Warnings:

  - You are about to drop the `Seat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_eventId_fkey";

-- DropTable
DROP TABLE "Seat";

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "price" DECIMAL(8,2),
    "is_booked" BOOLEAN,
    "purchased_time" TIMESTAMPTZ(6),

    CONSTRAINT "Seats_pkey" PRIMARY KEY ("id","event_id")
);

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "fk_event" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
