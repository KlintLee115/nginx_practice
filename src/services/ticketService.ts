import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { ServiceResponse } from "../utils/types"

type BuyTicketServiceResponse = {
    success: boolean
    message: string
    data?: {
        price: number
        id: number
        event_id: number
        isBought: boolean | null
        purchased_time: Date | null
        buyerEmail: string | null
    }[]
}

type TicketType = Prisma.ticketsGetPayload<{ select?: any }>
type TicketsType = TicketType[]

export async function getTicketsInfo(email?: string, seatIds?: number[]): Promise<ServiceResponse<TicketsType>> {
    try {

        const where: Prisma.ticketsWhereInput = {}

        if (email) where.buyerEmail = email
        if (seatIds) where.id = {
            in: seatIds
        }

        const tickets = await prisma.tickets.findMany({
            where
        })

        return {
            success: true,
            data: tickets
        }
    }

    catch (error) {
        console.error(error)
        throw new Error('An error occurred while processing the transaction.')
    }
}

export async function buyTicket(email: string, seatIds: number[]): Promise<BuyTicketServiceResponse> {

    const transaction = await prisma.$transaction(async prisma => {
        try {

            await prisma.$executeRaw`SET LOCAL lock_timeout = '2s';`

            const ticketsToBuy: TicketsType = await prisma.$queryRaw`
                    SELECT * FROM public.tickets WHERE id IN (${Prisma.join(seatIds)}) FOR UPDATE;
                `

            if (ticketsToBuy.some(ticket => ticket.isBought && ticket.buyerEmail !== email)) {
                return { success: false, message: 'One or more tickets are unavailable.' }
            }

            // Mark the tickets as bought
            await prisma.tickets.updateMany({
                where: { id: { in: seatIds } },
                data: { isBought: true, buyerEmail: email },
            });

            // Fetch and return the updated ticket information
            const boughtTickets = (await prisma.tickets.findMany({
                where: { id: { in: seatIds } }
            })).map(ticket => ({
                ...ticket,
                price: ticket.price ? ticket.price.toNumber() : null
            }));

            return { success: true, message: 'Tickets purchased successfully.', data: boughtTickets };
        } catch (error) {

            if (error.message.includes('lock timeout')) {
                return { success: false, message: 'The tickets are currently locked by another process.', statusCode: 423 } // HTTP 423: Locked
            }

            throw (`An error occurred while processing the transaction: ${error}`)
        }
    })

    return transaction
}

export async function refundTicket(email: string, seatIds: number[]): Promise<ServiceResponse<never>> {
    const transaction = await prisma.$transaction(async (prisma) => {
        try {

            await prisma.$executeRaw`SET LOCAL lock_timeout = '2s';`

            // Fetch booked seats
            const seats: TicketsType = await prisma.$queryRaw`
                SELECT * FROM tickets WHERE id IN (${Prisma.join(seatIds)}) AND isBought = true AND buyerEmail = ${email} FOR UPDATE;
            `

            if (seats.length !== seatIds.length) {
                return { success: false, message: 'One or more seats are not booked.', statusCode: 400 }
            }

            // Update seats as not booked
            await prisma.tickets.updateMany({
                where: { id: { in: seatIds } },
                data: { isBought: false, buyerEmail: null },
            })

            return { success: true, message: 'Tickets refunded successfully.' } as ServiceResponse<never>
        } catch (error) {

            if (error.message.includes('lock timeout')) {
                return { success: false, message: 'The tickets are currently locked by another process.', statusCode: 423 } // HTTP 423: Locked
            }

            throw new Error(`An error occurred while processing the transaction: ${error}`)
        }
    })


    return transaction
}