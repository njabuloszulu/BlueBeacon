import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { publishEvent, subscribeEvent } from '@packages/events';
import { prisma } from '@packages/db';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Notification Service API',
  port: Number(process.env.PORT ?? 4009)
});
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;
const mailer = nodemailer.createTransport({
  jsonTransport: true
});

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'notification-service', status: 'ok' });
});

app.put('/preferences/:userId', async (req, res) => {
  const next = await prisma.notificationPreference.upsert({
    where: { userId: req.params.userId },
    create: {
      id: uuidv4(),
      userId: req.params.userId,
      pushEnabled: Boolean(req.body.push),
      smsEnabled: Boolean(req.body.sms),
      emailEnabled: Boolean(req.body.email)
    },
    update: {
      pushEnabled: Boolean(req.body.push),
      smsEnabled: Boolean(req.body.sms),
      emailEnabled: Boolean(req.body.email)
    }
  });
  res.json(next);
});

app.post('/notify', async (req, res) => {
  const severity = (req.body.severity ?? 'info') as 'info' | 'warning' | 'emergency';
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: String(req.body.userId) }
  });
  const bypassPrefs = severity === 'emergency';
  const usePush = bypassPrefs || prefs?.pushEnabled !== false;
  const useSms = bypassPrefs || prefs?.smsEnabled === true;
  const useEmail = bypassPrefs || prefs?.emailEnabled === true;

  const channels: string[] = [];
  if (usePush) {
    channels.push('push');
  }
  if (useSms) {
    channels.push('sms');
  }
  if (useEmail) {
    channels.push('email');
  }

  const records = [];
  for (const channel of channels) {
    records.push(
      prisma.notification.create({
        data: {
          id: uuidv4(),
          userId: String(req.body.userId),
          channel,
          severity,
          message: String(req.body.message ?? ''),
          delivered: true
        }
      })
    );
  }
  const saved = await Promise.all(records);

  if (useSms && twilioClient && req.body.phone) {
    await twilioClient.messages.create({
      from: process.env.TWILIO_FROM_NUMBER ?? '+10000000000',
      to: String(req.body.phone),
      body: String(req.body.message ?? '')
    });
  }
  if (useEmail && req.body.email) {
    await mailer.sendMail({
      to: String(req.body.email),
      from: 'noreply@bluebeacon.local',
      subject: `BlueBeacon ${severity.toUpperCase()} notification`,
      text: String(req.body.message ?? '')
    });
  }

  const payload = {
    id: saved[0]?.id ?? uuidv4(),
    userId: String(req.body.userId),
    severity,
    message: String(req.body.message ?? ''),
    channels,
    createdAt: new Date().toISOString()
  };
  await publishEvent('notification.created', payload);
  res.status(202).json(payload);
});

app.post('/broadcast/officers', async (req, res) => {
  const message = String(req.body.message ?? '');
  await publishEvent('notification.officer.broadcast', { message, stationId: req.body.stationId });
  res.status(202).json({ delivered: 'queued', message });
});

app.post('/sos', async (req, res) => {
  const payload = {
    id: uuidv4(),
    userId: String(req.body.userId ?? ''),
    lat: Number(req.body.lat),
    lng: Number(req.body.lng),
    message: String(req.body.message ?? 'SOS')
  };
  await publishEvent('notification.sos.triggered', payload);
  res.status(202).json(payload);
});

app.post('/notifications', async (req, res) => {
  req.body.severity = req.body.severity ?? 'info';
  const severity = (req.body.severity ?? 'info') as 'info' | 'warning' | 'emergency';
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: String(req.body.userId) }
  });
  const bypassPrefs = severity === 'emergency';
  const usePush = bypassPrefs || prefs?.pushEnabled !== false;
  const useSms = bypassPrefs || prefs?.smsEnabled === true;
  const useEmail = bypassPrefs || prefs?.emailEnabled === true;
  const channels: string[] = [];
  if (usePush) channels.push('push');
  if (useSms) channels.push('sms');
  if (useEmail) channels.push('email');
  const saved = await prisma.notification.create({
    data: {
      id: uuidv4(),
      userId: String(req.body.userId),
      channel: channels.join(','),
      severity,
      message: String(req.body.message ?? ''),
      delivered: true
    }
  });
  res.status(202).json(saved);
});

app.post('/broadcast', async (req, res) => {
  const message = String(req.body.message ?? '');
  await publishEvent('notification.officer.broadcast', { message, stationId: req.body.stationId });
  res.status(202).json({ delivered: 'queued', message });
});

await subscribeEvent<{ judgeId?: string; warrantId: string; docketId: string }>(
  'notification.judge.required',
  async (payload) => {
    if (!payload.judgeId) {
      return;
    }
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: payload.judgeId,
        channel: 'push',
        severity: 'warning',
        message: `New warrant ${payload.warrantId} is waiting for your review.`,
        delivered: true
      }
    });
  }
);

await subscribeEvent<{ officerId?: string; warrantId: string; message: string }>(
  'notification.officer.required',
  async (payload) => {
    if (!payload.officerId) {
      return;
    }
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: payload.officerId,
        channel: 'push',
        severity: 'info',
        message: payload.message,
        delivered: true
      }
    });
  }
);

app.listen(Number(process.env.PORT ?? 4009), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'notification-service'} listening on ${process.env.PORT ?? 4009}`);
});
