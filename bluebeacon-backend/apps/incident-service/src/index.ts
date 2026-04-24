import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { loadEnv } from '@packages/config';
import { publishEvent } from '@packages/events';
import type { IncidentStatus } from '@packages/types';
import { appendAuditEvent, prisma } from '@packages/db';
import { authenticateJwt, requireRole } from '@packages/auth-middleware';
import { mountServiceDocs } from '@packages/swagger';

const env = loadEnv({
  ...process.env,
  SERVICE_NAME: process.env.SERVICE_NAME ?? 'incident-service',
  PORT: process.env.PORT ?? '4002'
});
const app = express();
const server = createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });
const upload = multer({ storage: multer.memoryStorage() });

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Incident Service API',
  port: env.PORT
});

function distanceInKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const calc =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc)));
}

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'incident-service', status: 'ok' });
});

app.post('/incidents', upload.array('media', 5), async (req, res) => {
  const reporterId = String(req.body.reporterId ?? '');
  const incidentType = String(req.body.incidentType ?? '');
  const description = String(req.body.description ?? '');
  const locationLat = Number(req.body.locationLat ?? 0);
  const locationLng = Number(req.body.locationLng ?? 0);

  const officers = await prisma.user.findMany({
    where: { role: 'officer', isVerified: true },
    select: { id: true, stationId: true }
  });
  let nearestOfficerId: string | undefined;
  if (officers.length > 0) {
    const withDistance = officers.map((officer) => {
      // Station coordinates can be externalized later; fallback to CBD center.
      const stationLat = -33.9249;
      const stationLng = 18.4241;
      return { officerId: officer.id, distance: distanceInKm(locationLat, locationLng, stationLat, stationLng) };
    });
    nearestOfficerId = withDistance.sort((left, right) => left.distance - right.distance)[0]?.officerId;
  }

  const incident = await prisma.incident.create({
    data: {
      id: uuidv4(),
      reporterId,
      incidentType,
      description,
      locationLat,
      locationLng,
      status: 'pending',
      assignedOfficerId: nearestOfficerId ?? null
    }
  });

  for (const file of (req.files as Express.Multer.File[] | undefined) ?? []) {
    await prisma.incidentMedia.create({
      data: {
        id: uuidv4(),
        incidentId: incident.id,
        objectKey: `incident-media/${incident.id}/${file.originalname}`,
        mediaType: file.mimetype
      }
    });
  }

  await appendAuditEvent({
    actorId: reporterId,
    action: 'incident.create',
    entity: 'incident',
    entityId: incident.id,
    afterState: incident,
    ipAddress: req.ip ?? ''
  });
  await publishEvent('incident.created', incident);
  io.to(`incident:${incident.id}`).emit('incident.updated', incident);
  res.status(201).json(incident);
});

app.get('/incidents/:id/status', async (req, res) => {
  const incident = await prisma.incident.findUnique({ where: { id: String(req.params.id) } });
  if (!incident) {
    res.status(404).json({ message: 'Incident not found' });
    return;
  }
  res.json({ id: incident.id, status: incident.status, assignedOfficerId: incident.assignedOfficerId });
});

app.post('/incidents/:id/transition', async (req, res) => {
  const incident = await prisma.incident.findUnique({ where: { id: String(req.params.id) } });
  if (!incident) {
    res.status(404).json({ message: 'Incident not found' });
    return;
  }
  const next = String(req.body.status) as IncidentStatus;
  const allowed: Record<IncidentStatus, IncidentStatus[]> = {
    pending: ['assigned', 'escalated'],
    assigned: ['investigating', 'escalated'],
    investigating: ['court_ready', 'closed', 'escalated'],
    court_ready: ['closed'],
    closed: [],
    escalated: ['assigned', 'investigating']
  };
  if (!(allowed[incident.status as IncidentStatus] ?? []).includes(next)) {
    res.status(400).json({ message: 'Invalid transition', from: incident.status, to: next });
    return;
  }
  const updated = await prisma.incident.update({
    where: { id: incident.id },
    data: { status: next }
  });
  await appendAuditEvent({
    actorId: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'system',
    action: 'incident.transition',
    entity: 'incident',
    entityId: incident.id,
    beforeState: { status: incident.status },
    afterState: { status: updated.status },
    ipAddress: req.ip ?? ''
  });
  if (next === 'assigned') {
    await publishEvent('incident.accepted', { incidentId: incident.id, assignedOfficerId: updated.assignedOfficerId });
  }
  await publishEvent('incident.updated', updated);
  io.to(`incident:${updated.id}`).emit('incident.updated', updated);
  res.json(updated);
});

app.post('/incidents/:id/accept', authenticateJwt, requireRole('officer'), async (req, res) => {
  const incident = await prisma.incident.findUnique({ where: { id: String(req.params.id) } });
  if (!incident) {
    res.status(404).json({ message: 'Incident not found' });
    return;
  }
  const assignedOfficerId = req.auth?.sub ?? null;
  const updated = await prisma.incident.update({
    where: { id: incident.id },
    data: { status: 'assigned', assignedOfficerId }
  });
  await publishEvent('incident.accepted', { incidentId: updated.id, assignedOfficerId });
  res.json(updated);
});

io.on('connection', (socket) => {
  socket.on('incident.subscribe', (incidentId: string) => {
    socket.join(`incident:${incidentId}`);
  });
});

server.listen(env.PORT, () => {
  console.log(`${process.env.SERVICE_NAME ?? 'incident-service'} listening on ${env.PORT}`);
});
