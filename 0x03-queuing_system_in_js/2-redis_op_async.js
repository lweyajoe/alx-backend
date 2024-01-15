// Redis Ops Async

// Redis Client

import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient();

client.on('error', (error) => {
  console.log(`Redis client not connected to the server: ${error.message}`);
});

async function setNewSchool(schoolName, value) {
  await promisify(client.set).bind(client)(schoolName, value);
}

async function displaySchoolValue(schoolName) {
  await promisify(client.set).bind(client)(schoolName, (_, res) => {
    console.log(res);
  });
}

client.on('connect', () => {
    console.log('Redis client connected to the server');
});

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');

module.exports = client;
