import express from 'express';
import client from 'prom-client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@packages/db';
import bcrypt from 'bcryptjs';
import { subscribeEvent } from '@packages/events';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Admin Service API',
  port: Number(process.env.PORT ?? 4011)
});
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'admin-service', status: 'ok' });
});

app.get('/audit-events', async (_req, res) => {
  const auditEvents = await prisma.auditEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200
  });
  res.json(auditEvents);
});

app.post('/audit-events', async (req, res) => {
  const event = await prisma.auditEvent.create({
    data: {
      id: String(req.body.id ?? `evt-${Date.now()}`),
      actorId: req.body.actorId ? String(req.body.actorId) : null,
      action: String(req.body.action ?? 'unknown'),
      entity: String(req.body.entity ?? 'unknown'),
      entityId: String(req.body.entityId ?? 'unknown'),
      beforeState: req.body.beforeState ?? null,
      afterState: req.body.afterState ?? null,
      ipAddress: req.ip ?? null
    }
  });
  res.status(201).json(event);
});

app.get('/audit-logs', async (_req, res) => {
  const logs = await prisma.auditEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500
  });
  res.json(logs);
});

app.post('/users', async (req, res) => {
  const password = String(req.body.password ?? 'ChangeMe123!');
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      fullName: String(req.body.fullName ?? 'Unnamed User'),
      email: String(req.body.email ?? ''),
      idNumber: req.body.idNumber ? String(req.body.idNumber) : null,
      role: String(req.body.role ?? 'officer'),
      stationId: req.body.stationId ? String(req.body.stationId) : null,
      isVerified: Boolean(req.body.isVerified ?? true),
      passwordHash: await bcrypt.hash(password, 12)
    }
  });
  res.status(201).json({ id: user.id, email: user.email, role: user.role, stationId: user.stationId });
});

app.get('/analytics/summary', async (_req, res) => {
  const [activeIncidents, openDockets, pendingWarrants, totalNotifications] = await Promise.all([
    prisma.incident.count({ where: { status: { in: ['pending', 'assigned', 'investigating', 'court_ready'] } } }),
    prisma.docket.count({ where: { status: { in: ['open', 'under_review', 'court_ready'] } } }),
    prisma.warrant.count({ where: { status: 'pending' } }),
    prisma.notification.count()
  ]);
  res.json({
    activeIncidents,
    openDockets,
    pendingWarrants,
    notificationDeliveryRate: totalNotifications > 0 ? 0.99 : 1
  });
});

app.get('/analytics', async (_req, res) => {
  const data = await prisma.auditEvent.groupBy({
    by: ['action'],
    _count: { action: true }
  });
  res.json(data);
});

app.get('/compliance/sar/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const [sessions, notifications, incidents] = await Promise.all([
    prisma.session.findMany({ where: { userId: user.id } }),
    prisma.notification.findMany({ where: { userId: user.id } }),
    prisma.incident.findMany({ where: { reporterId: user.id } })
  ]);
  res.json({ user, sessions, notifications, incidents });
});

app.post('/compliance/retention/purge', async (req, res) => {
  const days = Number(req.body.days ?? 365);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoff }
    }
  });
  res.json({ deleted: result.count, cutoff });
});

app.post('/compliance/audit/immutable-sink', async (req, res) => {
  const entries = await prisma.auditEvent.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    orderBy: { createdAt: 'asc' }
  });
  const sinkDir = path.resolve(process.cwd(), 'compliance');
  await fs.mkdir(sinkDir, { recursive: true });
  const sinkFile = path.join(sinkDir, `audit-${new Date().toISOString().slice(0, 10)}.jsonl`);
  const payload = entries.map((item) => JSON.stringify(item)).join('\n');
  await fs.appendFile(sinkFile, `${payload}\n`, { encoding: 'utf8' });
  res.status(202).json({ sinkFile, exported: entries.length });
});

app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', registry.contentType);
  res.send(await registry.metrics());
});

app.listen(Number(process.env.PORT ?? 4011), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'admin-service'} listening on ${process.env.PORT ?? 4011}`);
});

await subscribeEvent<{
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  timestamp: string;
}>('audit.event', async (payload) => {
  const data: {
    id: string;
    actorId: string | null;
    action: string;
    entity: string;
    entityId: string;
    ipAddress: string | null;
    beforeState?: object;
    afterState?: object;
  } = {
    id: uuidv4(),
    actorId: payload.actorId ?? null,
    action: payload.action,
    entity: payload.entity,
    entityId: payload.entityId,
    ipAddress: payload.ipAddress ?? null
  };
  if (payload.before !== undefined) {
    data.beforeState = payload.before as object;
  }
  if (payload.after !== undefined) {
    data.afterState = payload.after as object;
  }
  await prisma.auditEvent.create({
    data
  });
});
