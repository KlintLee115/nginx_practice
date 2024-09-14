import express from 'express'
import { buyTicket, getTicketsInfo, refundTicket } from '../services/ticketService'
import { FailServiceResponse } from '../utils/types'

const router = express.Router()

router.get('/', async (req, res) => {
    const { email, seatIds }: { email?: string, seatIds?: number[] } = req.body

    try {
        const response = await getTicketsInfo(email, seatIds)

        if (!response.success) {
            const { statusCode, message } = response as FailServiceResponse
            return res.status(statusCode).json(message)
        }

        return res.json(response.data)
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' + error })
    }
})

router.post('/buy', async (req, res) => {
    const { seatIds, email } = req.body

    try {
        const response = await buyTicket(email, seatIds)

        if (!response.success) {

            const { statusCode, message } = response as FailServiceResponse

            return res.status(statusCode).json(message)
        }

        return res.json(response.data)
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error: ' + error })
    }
})

// Route to refund tickets
router.delete('/refund', async (req, res) => {
    const { seatIds, email } = req.body

    try {
        const response = await refundTicket(email, seatIds)

        if (response.success) return res.json({ message: 'Refunded successfully' })

        const { statusCode, message } = response as FailServiceResponse

        return res.status(statusCode).json(message)

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error ' + error })
    }
})

export default router