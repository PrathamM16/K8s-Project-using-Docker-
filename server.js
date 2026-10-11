const express = require('express');
const { Pool } = require('pg');
const amqp = require('amqplib');

const app = express();
app.use(express.json());
const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});
let channel = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function init() {
  for (;;) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS orders(
        id SERIAL PRIMARY KEY, item TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING', created_at TIMESTAMP DEFAULT now())`);
      const conn = await amqp.connect(process.env.RABBIT_URL);
      channel = await conn.createChannel();
      await channel.assertQueue('orders', { durable: true });
      console.log('Connected to Postgres + RabbitMQ');
      return;
    } catch (e) { console.log('Waiting for dependencies:', e.message); await sleep(3000); }
  }
}

app.get('/api/health', (req, res) => channel ? res.send('ok') : res.status(503).send('not ready'));

app.get('/api/orders', async (req, res) => {
  const r = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 20');
  res.json(r.rows);
});

app.post('/api/orders', async (req, res) => {
  const r = await pool.query('INSERT INTO orders(item) VALUES($1) RETURNING *', [req.body.item]);
  channel.sendToQueue('orders', Buffer.from(JSON.stringify({ id: r.rows[0].id })), { persistent: true });
  res.status(201).json(r.rows[0]);
});

init().then(() => app.listen(3000, () => console.log('API on :3000')));
