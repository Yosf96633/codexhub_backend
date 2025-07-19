import amqp from 'amqplib'

const QUEUE = 'code_folders'

export async function createChannel() {
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()
  await channel.assertQueue(QUEUE, { durable: true })
   console.log("Connection build")
  return { channel, connection }
}

export async function sendToQueue(path: string) {
  const { channel } = await createChannel();
  console.log("Send to queue run")
  channel.sendToQueue(QUEUE, Buffer.from(path), { persistent: true })
  console.log(`📬 Sent to queue: ${path}`)
  setTimeout(() => channel.close(), 500) // clean up
}
