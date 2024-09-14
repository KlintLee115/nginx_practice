import express from 'express';
import eventsRouter from './controllers/eventsController'
import initRouter from './controllers/initController'
import ticketsRouter from './controllers/ticketsController'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import spdy from 'spdy';

// const keyPath = path.resolve(__dirname, '../key.pem');
// const certPath = path.resolve(__dirname, '../cert.pem');

// const options = {
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(certPath)
// }

const app = express();

app.use(express.json());
app.use(cors())

app.get('/', (_, res) => res.send("hello world"))

app.use('/api/events/', eventsRouter)
app.use('/api/init/', initRouter)
app.use('/api/tickets/', ticketsRouter)

// const server = spdy.createServer(options, app);

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})