import { Router } from 'express'
import { updateEvent, deleteEvent, getEvents, createEvent, EventInterface } from '../services/eventService'
import NodeCache from 'node-cache'
import { IsNullOrUndefined } from '../utils/functions'
import { FailServiceResponse } from '../utils/types'

const eventsCache = new NodeCache()

const router = Router()

router.get('/', async (req, res) => {

    const { take = '5', skip = '0', artistName, title, location, begin_datetime, end_datetime } =
        req.query as { id?: string, take?: string, skip?: string, title?: string, artistName?: string, location?: string, begin_datetime: string, end_datetime: string }

    try {

        let events: EventInterface[]

        const beginDateTime = begin_datetime ? new Date(begin_datetime) : undefined
        const endDateTime = end_datetime ? new Date(end_datetime) : undefined
        const takeNumber = parseInt(take)
        const skipNumber = parseInt(skip)

        const cacheKey = artistName + title

        const cachedEvent = eventsCache.get(cacheKey)

        if (cachedEvent) return res.json(cachedEvent)

        events = await getEvents(title, artistName, beginDateTime, endDateTime, location, takeNumber, skipNumber)

        res.send(events)
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving events: ', error })
    }
})

router.post('/', async (req, res) => {
    try {
        const { title, artistId, location, end_datetime, begin_datetime } = req.body

        if (IsNullOrUndefined(title) || IsNullOrUndefined(artistId) || IsNullOrUndefined(location)
            || IsNullOrUndefined(end_datetime) || IsNullOrUndefined(begin_datetime)) {
            return res.status(500).json({ message: 'Lack of info' })
        }

        res.send(await createEvent(title, artistId, begin_datetime, end_datetime, location))
    }
    catch (err) {
        res.status(500).json({ message: 'Error creating event', err })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const { title, artistId } = req.body

        const response = await updateEvent(id, { title, artistId })

        if (!response.success) {

            const failResponse = response as FailServiceResponse

            res.status(failResponse.statusCode).json(failResponse.message)
        }
        res.status(200).json(response.message)
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error })
    }
})

router.delete('/', deleteEvent)

export default router