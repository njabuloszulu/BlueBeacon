import { StringCodec, connect, type NatsConnection } from 'nats';

const codec = StringCodec();

export interface EventEnvelope<T = unknown> {
  type: string;
  payload: T;
  occurredAt: string;
}

let connection: NatsConnection | null = null;

export async function getNatsClient(): Promise<NatsConnection> {
  if (connection) {
    return connection;
  }

  connection = await connect({
    servers: process.env.NATS_URL ?? 'nats://localhost:4222',
    name: process.env.SERVICE_NAME ?? 'service'
  });

  return connection;
}

export async function publishEvent<T>(subject: string, payload: T): Promise<void> {
  const nc = await getNatsClient();
  const envelope: EventEnvelope<T> = {
    type: subject,
    payload,
    occurredAt: new Date().toISOString()
  };
  nc.publish(subject, codec.encode(JSON.stringify(envelope)));
}

export async function subscribeEvent<T>(
  subject: string,
  handler: (payload: T, envelope: EventEnvelope<T>) => Promise<void> | void
): Promise<void> {
  const nc = await getNatsClient();
  const sub = nc.subscribe(subject);
  (async () => {
    for await (const msg of sub) {
      try {
        const envelope = JSON.parse(codec.decode(msg.data)) as EventEnvelope<T>;
        await handler(envelope.payload, envelope);
      } catch {
        // Keep subscription alive on malformed events.
      }
    }
  })();
}
