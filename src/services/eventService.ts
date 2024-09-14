import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma'
import { ServiceResponse } from '../utils/types';

export interface EventInterface {
    id: number;
    title: string;
    artistId: number;
    location: string;
    begin_datetime: Date;
    end_datetime: Date;
}

export async function getEvents(title?: string, artistName?: string, begin_datetime?: Date, end_datetime?: Date, location?: string, take: number = 5, skip: number = 0): Promise<EventInterface[]> {

    let where: Prisma.EventWhereInput = {}

    if (title) where.title = { contains: title };
    if (artistName) where.artist = { name: { contains: artistName } };
    if (location) where.location = { contains: location };
    if (begin_datetime) {
        where.begin_datetime = {
            gte: begin_datetime
        }
    }

    if (end_datetime) {
        where.begin_datetime = {
            lte: end_datetime
        }
    }

    return await prisma.event.findMany({
        take,
        skip,
        where,
        orderBy: {
            begin_datetime: "asc"
        }
    })
}

export const getEventById = async (id: number) => await prisma.event.findUnique({where: { id }})

export async function createEvent(title: string, artistId: number, begin_datetime: Date, end_datetime: Date, location: string) {
    return await prisma.event.create({
        data: {
            title: title,
            artistId: artistId,
            begin_datetime,
            end_datetime,
            location
        }
    })
}

export async function updateEvent(id: number, { title, artistId }: { title: string, artistId: number }): Promise<ServiceResponse<never>> {

    const eventToUpdate = await prisma.event.findUnique({
        where: { id }
    })

    if (!eventToUpdate) {
        return { success: false, message: "Event not found.", statusCode: 404 };
    }

    if (!title && !artistId) {
        return { success: false, message: "Nothing to update.", statusCode: 204 };
    }

    if (title) eventToUpdate.title = title

    if (artistId) {
        const artist = await prisma.artist.findUnique({
            where: { id: artistId }
        })

        if (!artist) {
            return { success: false, message: "Artist not found.", statusCode: 404 }
        }

        eventToUpdate.artistId = artistId
    }

    return { success: true, message: "Event updated successfully"}
}

export async function deleteEvent(eventId: number) {

    await prisma.event.delete({
        where: {
            id: eventId
        }
    })
    // Implement event delete logic
    return { success: true, message: "Event deleted successfully", statusCode: 200 };
}