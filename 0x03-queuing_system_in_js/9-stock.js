// Stock

import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';

const app = express();
const client = createClient();

client.on('error', (error) => {
    console.log(`Redis client not connected to the server: ${error.message}`);
});

client.on('connect', () => {
    console.log('Redis client connected to the server');
});

const listProducts = [
    { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
    { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
    { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
    { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 }
];

const getItemById = (id) => {
    const item = listProducts.find((item) => item.itemId === id);
    return item;
};

const reserveStockById = async (itemId, stock) => {
    return promisify(client.set).bind(client)(`item.${itemId}`, stock);
};

const getCurrentReservedStockById = async (itemId) => {
    return promisify(client.get).bind(client)(`item.${itemId}`);
};

app.get('/list_products', (req, res) => {
    res.send(JSON.stringify(listProducts));
});

app.get('/list_products/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const item = getItemById(itemId);
    if (!item) {
        return res.status(404).send({ status: 'Product not found' });
    }
    const currentStock = await getCurrentReservedStockById(itemId);
    item.currentQuantity = currentStock;
    return res.send(item);
});

app.get('/reserve_product/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const item = getItemById(itemId);
    if (!item) {
        return res.status(404).send({ status: 'Product not found' });
    }
    const currentStock = await getCurrentReservedStockById(itemId);
    if (currentStock <= 0) {
        return res.status(403).send({ status: 'Not enough stock available', itemId });
    }
    await reserveStockById(itemId, parseInt(currentStock) - 1);
    return res.send({ status: 'Reservation confirmed', itemId });
});

app.listen(1245, () => {
    console.log('App running on localhost port 1245');
});
