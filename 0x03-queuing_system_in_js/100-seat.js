// Can I have a seat?

import { createQueue } from 'kue';
import { createClient } from 'redis';
import { promisify } from 'util';
import express from 'express';


const queue = createQueue();
const client = createClient({ name: 'reserveSeat'});
const app = express();
let reservationEnabled = false;

client.on('error', (error) => {
    console.log(`Redis client not connected to the server: ${error.message}`);
});

client.on('connect', () => {
    console.log('Redis client connected to the server');
});

const reserveSeat = async (number) => {
    promisify(client.set).bind(client)('available_seats', number);
};

const getCurrentAvailableSeats = async () => {
    return promisify(client.get).bind(client)('available_seats');
};

app.get('/available_seats', async (_, res) => {
    const availableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats: availableSeats });
});

app.get('/reserve_seat', async (_, res) => {
    if (!reservationEnabled) {
        return res.json({ status: 'Reservation are blocked' });
    }
    const availableSeats = await getCurrentAvailableSeats();
    if (availableSeats <= 0) {
        return res.json({ status: 'Reservation are blocked' });
    }
    const job = queue.create('reserve_seat', {}).save((error) => {
        if (!error) {
            res.json({ status: 'Reservation in process' });
        } else {
            res.json({ status: 'Reservation failed' });
        }
    });
    job.on('complete', () => {
        console.log(`Seat reservation job ${job.id} completed`);
    });
    job.on('failed', (error) => {
        console.log(`Seat reservation job ${job.id} failed: ${error}`);
    });
});

app.get('/process', async (_, res) => {
    queue.process('reserve_seat', async (job, done) => {
        const availableSeats = await getCurrentAvailableSeats();
        if (availableSeats <= 0) {
            done(Error('Not enough seats available'));
        }
        await reserveSeat(availableSeats - 1);
        if (availableSeats - 1 === 0) {
            reservationEnabled = false;
        }
        done();
    });
    res.json({ status: 'Queue processing' });
});

app.listen(1245, () => {
    reserveSeat(50);
    reservationEnabled = true;
    console.log('API available on localhost port 1245');
});
