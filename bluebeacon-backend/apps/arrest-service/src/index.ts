import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { BailStatus } from '@packages/types';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { publishEvent } from '@packages/events';
import { appendAuditEvent, prisma } from '@packages/db';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Arrest Service API',
  port: Number(process.env.PORT ?? 4004)
});
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
const detentionQueue = new Queue('detention-alerts', { connection: redis });

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'arrest-service', status: 'ok' });
});

app.post('/arrests', async (req, res) => {
  const now = new Date();
  const arrest = {
    id: uuidv4(),
    suspectFullName: String(req.body.suspectFullName ?? ''),
    suspectIdNumber: String(req.body.suspectIdNumber ?? ''),
    biometricRef: req.body.biometricRef ? String(req.body.biometricRef) : undefined,
    docketId: String(req.body.docketId ?? ''),
    charges: Array.isArray(req.body.charges) ? req.body.charges.map(String) : [],
    arrestLocation: req.body.arrestLocation ? String(req.body.arrestLocation) : undefined,
    bailStatus: 'not_applied' as BailStatus,
    bailAmount: req.body.bailAmount ? Number(req.body.bailAmount) : undefined,
    cellNumber: String(req.body.cellNumber ?? 'UNASSIGNED'),
    arrestDatetime: now
  };
  const created = await prisma.arrest.create({
    data: {
      id: arrest.id,
      suspectFullName: arrest.suspectFullName,
      suspectIdNumber: arrest.suspectIdNumber,
      biometricRef: arrest.biometricRef ?? null,
      docketId: arrest.docketId,
      charges: arrest.charges,
      arrestLocation: arrest.arrestLocation ?? null,
      bailStatus: arrest.bailStatus,
      bailAmount: arrest.bailAmount ?? null,
      cellNumber: arrest.cellNumber,
      arrestDatetime: arrest.arrestDatetime
    }
  });
  await detentionQueue.add(
    'hold-limit-warning',
    { arrestId: created.id, docketId: created.docketId },
    { delay: 47 * 60 * 60 * 1000 }
  );
  await appendAuditEvent({
    actorId: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'system',
    action: 'arrest.create',
    entity: 'arrest',
    entityId: created.id,
    afterState: created,
    ipAddress: req.ip ?? ''
  });
  await publishEvent('arrest.created', created);
  res.status(201).json(created);
});

app.post('/arrests/:id/bail-apply', async (req, res) => {
  const arrest = await prisma.arrest.findUnique({ where: { id: req.params.id } });
  if (!arrest) {
    res.status(404).json({ message: 'Arrest not found' });
    return;
  }
  const updated = await prisma.arrest.update({
    where: { id: arrest.id },
    data: { bailStatus: 'applied' }
  });
  await prisma.bailApplication.create({
    data: {
      id: uuidv4(),
      arrestId: arrest.id,
      warrantId: req.body.warrantId ? String(req.body.warrantId) : null,
      officerId: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'unknown',
      status: 'submitted',
      reason: req.body.reason ? String(req.body.reason) : null
    }
  });
  await publishEvent('bail.application.submitted', { arrestId: arrest.id, warrantId: req.body.warrantId });
  res.json(updated);
});

app.post('/bail', async (req, res) => {
  const arrestId = String(req.body.arrestId ?? '');
  const arrest = await prisma.arrest.findUnique({ where: { id: arrestId } });
  if (!arrest) {
    res.status(404).json({ message: 'Arrest not found' });
    return;
  }
  const decision = String(req.body.decision ?? 'denied') as BailStatus;
  const bailAmount = req.body.bailAmount ? Number(req.body.bailAmount) : undefined;
  const updated = await prisma.arrest.update({
    where: { id: arrest.id },
    data: {
      bailStatus: decision,
      bailAmount: bailAmount ?? null
    }
  });
  await prisma.bailApplication.updateMany({
    where: { arrestId: arrest.id, status: 'submitted' },
    data: { status: decision, judgeId: req.body.judgeId ? String(req.body.judgeId) : null }
  });
  await publishEvent('bail.application.decided', { arrestId: arrest.id, decision, bailAmount });
  res.json(updated);
});

app.get('/cells/board', async (_req, res) => {
  const arrests = await prisma.arrest.findMany({ select: { cellNumber: true } });
  const occupancy = arrests.reduce<Record<string, number>>((acc, arrest) => {
    acc[arrest.cellNumber] = (acc[arrest.cellNumber] ?? 0) + 1;
    return acc;
  }, {});
  res.json({ occupancy });
});

app.get('/cells', async (_req, res) => {
  const arrests = await prisma.arrest.findMany({ select: { id: true, cellNumber: true, arrestDatetime: true } });
  res.json(arrests);
});

app.get('/suspects/check', async (req, res) => {
  const idNumber = String(req.query.idNumber ?? '');
  const matches = await prisma.arrest.findMany({ where: { suspectIdNumber: idNumber } });
  res.json({ matches, hasPriorRecord: matches.length > 0 });
});

app.listen(Number(process.env.PORT ?? 4004), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'arrest-service'} listening on ${process.env.PORT ?? 4004}`);
});
