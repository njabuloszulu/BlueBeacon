import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { publishEvent, subscribeEvent } from '@packages/events';
import { appendAuditEvent, prisma } from '@packages/db';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Case Service API',
  port: Number(process.env.PORT ?? 4003)
});

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'case-service', status: 'ok' });
});

app.post('/dockets', async (req, res) => {
  const docket = await prisma.docket.create({
    data: {
      id: uuidv4(),
      incidentId: String(req.body.incidentId),
      leadOfficerId: req.body.leadOfficerId ? String(req.body.leadOfficerId) : null,
      stationId: req.body.stationId ? String(req.body.stationId) : null,
      status: 'open',
      notes: []
    }
  });

  const charges = Array.isArray(req.body.charges) ? req.body.charges.map(String) : [];
  for (const charge of charges) {
    await prisma.docketCharge.create({
      data: { id: uuidv4(), docketId: docket.id, charge }
    });
  }

  await appendAuditEvent({
    actorId: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'system',
    action: 'docket.create',
    entity: 'docket',
    entityId: docket.id,
    afterState: { ...docket, charges },
    ipAddress: req.ip ?? ''
  });
  await publishEvent('case.docket.created', docket);
  res.status(201).json(docket);
});

app.post('/dockets/from-incident-accepted', async (req, res) => {
  const incidentId = String(req.body.incidentId);
  const docket = await prisma.docket.create({
    data: {
      id: uuidv4(),
      incidentId,
      leadOfficerId: req.body.assignedOfficerId ? String(req.body.assignedOfficerId) : null,
      status: 'open',
      notes: []
    }
  });
  await publishEvent('case.docket.auto_created', docket);
  res.status(201).json(docket);
});

app.patch('/dockets/:id/status', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) {
    res.status(404).json({ message: 'Docket not found' });
    return;
  }
  const next = String(req.body.status) as typeof docket.status;
  const allowed = {
    open: ['under_review'],
    under_review: ['court_ready', 'open'],
    court_ready: ['closed'],
    closed: []
  } as const;
  if (!(allowed[docket.status as keyof typeof allowed] as readonly string[]).includes(next)) {
    res.status(400).json({ message: 'Invalid transition' });
    return;
  }
  const updated = await prisma.docket.update({
    where: { id: docket.id },
    data: { status: next }
  });
  await publishEvent('case.docket.status_changed', updated);
  res.json(updated);
});

app.put('/dockets/:id/notes', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) {
    res.status(404).json({ message: 'Docket not found' });
    return;
  }
  const notes = Array.isArray(docket.notes) ? docket.notes : [];
  const nextNote = {
    id: uuidv4(),
    note: String(req.body.note ?? ''),
    by: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'unknown',
    at: new Date().toISOString(),
    attachments: Array.isArray(req.body.attachments) ? req.body.attachments.map(String) : [],
    evidenceIds: Array.isArray(req.body.evidenceIds) ? req.body.evidenceIds.map(String) : []
  };
  const nextNotes = [
    ...notes,
    nextNote
  ];
  const updated = await prisma.docket.update({ where: { id: docket.id }, data: { notes: nextNotes } });
  res.status(201).json({ docket: updated, note: nextNote });
});

app.get('/dockets/:id/notes', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) {
    res.status(404).json({ message: 'Docket not found' });
    return;
  }
  res.json(Array.isArray(docket.notes) ? docket.notes : []);
});

app.patch('/dockets/:id/notes/:noteId', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) {
    res.status(404).json({ message: 'Docket not found' });
    return;
  }
  const notes = Array.isArray(docket.notes) ? docket.notes : [];
  const nextNotes = notes.map((entry) => {
    if (typeof entry === 'object' && entry !== null && 'id' in entry && (entry as { id?: string }).id === req.params.noteId) {
      return {
        ...entry,
        note: String(req.body.note ?? (entry as { note?: string }).note ?? ''),
        updatedAt: new Date().toISOString()
      };
    }
    return entry;
  });
  const updated = await prisma.docket.update({ where: { id: docket.id }, data: { notes: nextNotes } });
  res.json(updated);
});

app.delete('/dockets/:id/notes/:noteId', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) {
    res.status(404).json({ message: 'Docket not found' });
    return;
  }
  const notes = Array.isArray(docket.notes) ? docket.notes : [];
  const nextNotes = notes.filter((entry) => {
    if (typeof entry === 'object' && entry !== null && 'id' in entry) {
      return (entry as { id?: string }).id !== req.params.noteId;
    }
    return true;
  });
  await prisma.docket.update({ where: { id: docket.id }, data: { notes: nextNotes } });
  res.status(204).send();
});

app.post('/dockets/:id/charges', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) {
    res.status(404).json({ message: 'Docket not found' });
    return;
  }
  const charge = await prisma.docketCharge.create({
    data: { id: uuidv4(), docketId: docket.id, charge: String(req.body.charge ?? '') }
  });
  res.status(201).json(charge);
});

await subscribeEvent<{ incidentId: string; assignedOfficerId?: string }>('incident.accepted', async (payload) => {
  const existing = await prisma.docket.findFirst({ where: { incidentId: payload.incidentId } });
  if (existing) {
    return;
  }
  const docket = await prisma.docket.create({
    data: {
      id: uuidv4(),
      incidentId: payload.incidentId,
      leadOfficerId: payload.assignedOfficerId ?? null,
      status: 'open',
      notes: []
    }
  });
  await publishEvent('case.docket.auto_created', docket);
});

app.listen(Number(process.env.PORT ?? 4003), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'case-service'} listening on ${process.env.PORT ?? 4003}`);
});
