const { Pool } = require('pg');
const amqp = require('amqplib');
const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  for (;;) {
    try {
      const conn = await amqp.connect(process.env.RABBIT_URL);
      const ch = await conn.createChannel();
      await ch.assertQueue('orders', { durable: true });
      ch.prefetch(1);
      console.log('Worker waiting for messages...');
      ch.consume('orders', async (msg) => {
        const { id } = JSON.parse(msg.content.toString());
        console.log('Processing order', id);
        await sleep(3000); // simulate slow work
        await pool.query("UPDATE orders SET status='PROCESSED' WHERE id=$1", [id]);
        ch.ack(msg);
      });
      return;
    } catch (e) { console.log('Retrying:', e.message); await sleep(3000); }
  }
})();
