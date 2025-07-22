import amqp from 'amqplib';
const QUEUE_NAME = 'code_folders';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fun } from '../../../embedding-worker/src/index';

async function waitUntilReady(
  dirPath: string,
  retries = 30,
  delay = 2000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = (attempt = 0) => {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        const nonEmpty = files.some(f => fs.statSync(path.join(dirPath, f)).size > 0);

        if (files.length > 0 && nonEmpty) {
          console.log(`✅ Folder ready with ${files.length} files`);
          return resolve();
        }
      }

      if (attempt >= retries) {
        return reject(new Error(`❌ Timeout waiting for folder: ${dirPath}`));
      }

      console.log(`⏳ Folder not ready, retrying... (${attempt + 1}/${retries})`);
      setTimeout(() => check(attempt + 1), delay);
    };

    check();
  });
}

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

          try {
            await waitUntilReady(messageContent);
            fun(messageContent);
          } catch (err) {
            console.error("❌ Directory not ready:", err);
          }

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
