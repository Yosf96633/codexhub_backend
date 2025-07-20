import amqp from 'amqplib';
const QUEUE_NAME = 'code_folders';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../embedder/.env') });
console.log('🔑 OpenAI Key loaded:', process.env.OPENAI_API_KEY ? '✅ Yes' : '❌ No');

async function startWorker() {
  try {
    const connection = await amqp.connect('amqp://localhost'); 
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`📡 Waiting for messages in queue: "${QUEUE_NAME}"`);

    channel.consume(
      QUEUE_NAME,
      async msg => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          console.log(`📥 Received message from queue: ${messageContent}`);
          channel.ack(msg); 
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error('❌ Worker failed:', err);
  }
}

startWorker();
