import { Router } from 'express';
import prisma from '../utils/prisma'
import { createTicketsForEventAsync, getOrCreateArtistByName } from '../services/initService';
import { Prisma } from '@prisma/client';

const router = Router()

router.post('/seats', async (req, res) => {
    const { eventId, numberOfSeats, meanPrice, sdPrice }: { meanPrice: number, sdPrice: number, eventId: number, numberOfSeats: number } = req.body;

    if (!eventId || !numberOfSeats) {
        return res.status(400).json({ message: 'EventId and numberOfSeats are required.' });
    }

    // Add seats to the event
    await createTicketsForEventAsync(meanPrice, sdPrice, eventId, numberOfSeats);

    return res.status(200).json({ message: `${numberOfSeats} seats initialized for event ${eventId}` });
}
)

router.post('/events', async (_, res) => {

    const artists = [
        "Drake", "Eminem", "Beyonce", "Taylor Swift", "Ed Sheeran",
        "Ariana Grande", "Justin Bieber", "Rihanna", "Kanye West", "Lady Gaga",
        "The Weeknd", "Post Malone", "Cardi B", "Travis Scott", "Dua Lipa",
        "Bruno Mars", "Billie Eilish", "Shawn Mendes", "Selena Gomez", "Sam Smith",
        "Katy Perry", "J Balvin", "Khalid", "Halsey", "Marshmello",
        "Imagine Dragons", "Adele", "Lizzo", "Sia", "Usher",
        "Jennifer Lopez", "Demi Lovato", "Maroon 5", "Migos"
    ]

    const locations = [
        "Event Hall, New York, NY, USA", "Concert Arena, Los Angeles, CA, USA", "Royal Albert Hall, London, England, UK",
        "Tokyo Dome, Tokyo, Japan", "Le Zenith, Paris, France", "Mercedes-Benz Arena, Berlin, Germany",
        "Sydney Opera House, Sydney, NSW, Australia", "Scotiabank Arena, Toronto, ON, Canada",
        "Oracle Park, San Francisco, CA, USA", "American Airlines Arena, Miami, FL, USA",
        "United Center, Chicago, IL, USA", "Bell Centre, Montreal, QC, Canada", "Palau Sant Jordi, Barcelona, Spain",
        "AFAS Live, Amsterdam, Netherlands", "Coliseum, Rome, Italy", "Odeon of Herodes Atticus, Athens, Greece",
        "Hong Kong Coliseum, Hong Kong", "Marina Bay Sands, Singapore", "Dubai Opera, Dubai, UAE",
        "Jio World Garden, Mumbai, India", "The Dome, Johannesburg, South Africa", "Luna Park, Buenos Aires, Argentina",
        "Allianz Parque, Sao Paulo, Brazil", "Auditorio Nacional, Mexico City, Mexico", "Olympic Park, Seoul, South Korea",
        "Gelora Bung Karno Stadium, Jakarta, Indonesia", "Bukit Jalil National Stadium, Kuala Lumpur, Malaysia",
        "Impact Arena, Bangkok, Thailand", "National Stadium, Warsaw, Poland", "Wiener Stadthalle, Vienna, Austria",
        "Altice Arena, Lisbon, Portugal", "O2 Arena, Prague, Czech Republic", "3Arena, Dublin, Ireland",
        "Friends Arena, Stockholm, Sweden", "Telenor Arena, Oslo, Norway", "Hallenstadion, Zurich, Switzerland",
        "Vienna Stadthalle, Vienna, Austria", "Forest National, Brussels, Belgium"
    ]

    const getRandomLocation = (): string => locations[Math.floor(Math.random() * locations.length)]

    function getRandomDateTime(start: Date, end: Date): Date {
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        return new Date(randomTime);
    }

    const random = Math.random;
    const events = [];

    for (let i = 0; i < 100; i++) {
        const randomArtistName = artists[Math.floor(random() * artists.length)];
        const artist = await getOrCreateArtistByName(randomArtistName)

        const beginDateTime = getRandomDateTime(new Date(2024, 0, 1), new Date(2024, 11, 30)); // Set the range for begin_datetime
        const endDateTime = getRandomDateTime(beginDateTime, new Date(2024, 11, 31)); // Ensure end_datetime is after begin_datetime

        const eventDto: Prisma.XOR<Prisma.EventCreateInput, Prisma.EventUncheckedCreateInput> = {
            title: `Event ${i + 1} featuring ${randomArtistName}`,
            artistId: artist.id,
            begin_datetime: beginDateTime,
            end_datetime: endDateTime,
            location: getRandomLocation()
        };

        const newEvent = await prisma.event.create({
            data: eventDto
        })

        events.push({
            artist: {
                id: artist.id,
                name: artist.name,
            },
            title: newEvent.title,
        });
    }

    return res.status(200).json(events);
})

export default router