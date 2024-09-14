import prisma from "../utils/prisma";
import { CreatePartitionSQL } from '../utils/strings';

export async function createTicketsForEventAsync(meanPrice: number, sd: number, eventId: number, numberOfSeats: number): Promise<void> {
    try {
        await createPartitionIfNotExists(eventId);

        // Function to generate a random price within one standard deviation of the mean price
        const generatePrice = (): number => {
            const minPrice = meanPrice - sd
            const maxPrice = meanPrice + sd

            return Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice
        };


        for (let i = 0; i < numberOfSeats; i++) {
            await prisma.tickets.createMany({
                data: {
                    event_id: eventId,
                    price: generatePrice()
                }
            })
        }
    }
    catch (err) {
        throw (err)
    }
}

async function createPartitionIfNotExists(eventId: number): Promise<void> {
    const partitionName = `tickets_eventid${eventId}`;

    const partitionSql = CreatePartitionSQL(partitionName, eventId)

    await prisma.$executeRawUnsafe(partitionSql);
}

export async function getOrCreateArtistByName(name: string) {

    const artist = await prisma.artist.findFirst({
        where: {
            name
        }
    })

    if (artist === null) return await prisma.artist.create({
        data: { name }
    })

    return artist
}
