import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { publishEvent } from '@packages/events';
import { prisma } from '@packages/db';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Dispatch Service API',
  port: Number(process.env.PORT ?? 4007)
});

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'dispatch-service', status: 'ok' });
});

app.post('/dispatch/calls', async (req, res) => {
  const call = await prisma.dispatchCall.create({
    data: {
      id: uuidv4(),
      incidentId: String(req.body.incidentId ?? ''),
      severity: String(req.body.severity ?? 'medium'),
      assignedUnit: req.body.assignedUnit ? String(req.body.assignedUnit) : null,
      status: String(req.body.status ?? 'new')
    }
  });
  io.emit('dispatch.call.created', call);
  await publishEvent('dispatch.call.created', call);
  res.status(201).json(call);
});

app.patch('/dispatch/calls/:id/reassign', async (req, res) => {
  const call = await prisma.dispatchCall.findUnique({ where: { id: req.params.id } });
  if (!call) {
    res.status(404).json({ message: 'Call not found' });
    return;
  }
  const updated = await prisma.dispatchCall.update({
    where: { id: call.id },
    data: { assignedUnit: String(req.body.assignedUnit ?? ''), status: String(req.body.status ?? 'assigned') }
  });
  io.emit('dispatch.call.reassigned', updated);
  await publishEvent('dispatch.call.reassigned', updated);
  res.json(updated);
});

app.post('/dispatch/units/:unitId/position', async (req, res) => {
  const unitId = req.params.unitId;
  const position = {
    lat: Number(req.body.lat),
    lng: Number(req.body.lng),
    at: new Date().toISOString()
  };
  await prisma.unitPosition.create({
    data: {
      id: uuidv4(),
      unitId,
      latitude: position.lat,
      longitude: position.lng,
      recordedAt: new Date(position.at)
    }
  });
  io.emit('dispatch.unit.position', { unitId, ...position });
  res.status(202).json({ unitId, ...position });
});

io.on('connection', (socket) => {
  void (async () => {
    const [calls, positions] = await Promise.all([
      prisma.dispatchCall.findMany({ orderBy: { createdAt: 'desc' }, take: 300 }),
      prisma.unitPosition.findMany({ orderBy: { recordedAt: 'desc' }, take: 300 })
    ]);
    const unitPositions = positions.reduce<Record<string, { lat: number; lng: number; at: string }>>((acc, item) => {
      if (!acc[item.unitId]) {
        acc[item.unitId] = { lat: item.latitude, lng: item.longitude, at: item.recordedAt.toISOString() };
      }
      return acc;
    }, {});
    socket.emit('dispatch.bootstrap', { calls, unitPositions });
  })();
});

server.listen(Number(process.env.PORT ?? 4007), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'dispatch-service'} listening on ${process.env.PORT ?? 4007}`);
});
