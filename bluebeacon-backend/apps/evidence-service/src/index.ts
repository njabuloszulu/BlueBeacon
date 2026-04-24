import express from 'express';
import multer from 'multer';
import bwipjs from 'bwip-js';
import { v4 as uuidv4 } from 'uuid';
import { publishEvent } from '@packages/events';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { appendAuditEvent, prisma } from '@packages/db';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Evidence Service API',
  port: Number(process.env.PORT ?? 4006)
});
const s3Config: { region: string; endpoint?: string; forcePathStyle?: boolean } = {
  region: process.env.AWS_REGION ?? 'af-south-1'
};
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true;
}
const s3 = new S3Client(s3Config);

async function scanWithClamAv(buffer: Buffer): Promise<boolean> {
  // Placeholder implementation: wire TCP scan to clamd in production.
  void buffer;
  return true;
}

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'evidence-service', status: 'ok' });
});

app.post('/evidence', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Missing evidence file' });
    return;
  }
  const isSafe = await scanWithClamAv(req.file.buffer);
  if (!isSafe) {
    res.status(400).json({ message: 'File rejected by malware scanner' });
    return;
  }

  const id = uuidv4();
  const barcode = `EV-${Date.now()}`;
  const objectKey = `evidence/${id}/${req.file.originalname}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET ?? 'bluebeacon-dev',
      Key: objectKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ServerSideEncryption: 'AES256'
    })
  );

  const record = await prisma.evidence.create({
    data: {
      id,
      docketId: String(req.body.docketId ?? ''),
      description: String(req.body.description ?? ''),
      evidenceType: String(req.body.evidenceType ?? 'physical'),
      barcode,
      storageLocation: objectKey,
      collectedBy: String(req.body.collectedBy ?? 'unknown'),
      collectedAt: new Date(),
      chainOfCustody: [
        {
          officerId: String(req.body.collectedBy ?? 'unknown'),
          reason: 'created',
          at: new Date().toISOString()
        }
      ]
    }
  });
  await appendAuditEvent({
    actorId: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'system',
    action: 'evidence.create',
    entity: 'evidence',
    entityId: record.id,
    afterState: record,
    ipAddress: req.ip ?? ''
  });
  await publishEvent('evidence.created', { ...record, filename: req.file.originalname });
  res.status(201).json(record);
});

app.post('/evidence/:id/custody', async (req, res) => {
  const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!evidence) {
    res.status(404).json({ message: 'Evidence not found' });
    return;
  }
  const entry = {
    officerId: String(req.body.officerId ?? 'unknown'),
    reason: String(req.body.reason ?? 'transfer'),
    at: new Date().toISOString()
  };
  const custodyLog = Array.isArray(evidence.chainOfCustody) ? evidence.chainOfCustody : [];
  const updated = await prisma.evidence.update({
    where: { id: evidence.id },
    data: {
      chainOfCustody: [...custodyLog, entry]
    }
  });
  await publishEvent('evidence.custody.updated', { evidenceId: evidence.id, entry });
  res.json(updated);
});

app.get('/evidence/:id/custody-log', async (req, res) => {
  const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!evidence) {
    res.status(404).json({ message: 'Evidence not found' });
    return;
  }
  res.json(evidence.chainOfCustody);
});

app.get('/evidence/:id/barcode.png', async (req, res) => {
  const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!evidence) {
    res.status(404).json({ message: 'Evidence not found' });
    return;
  }
  const png = await bwipjs.toBuffer({
    bcid: 'code128',
    text: evidence.barcode,
    scale: 3,
    height: 10
  });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});

app.post('/evidence/:id/dispose/approve', async (req, res) => {
  const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!evidence) {
    res.status(404).json({ message: 'Evidence not found' });
    return;
  }
  const commanderApproval = Boolean(req.body.commanderApproval);
  const prosecutorApproval = Boolean(req.body.prosecutorApproval);
  const status = commanderApproval && prosecutorApproval ? 'disposed' : 'pending_dual_approval';
  const updated = await prisma.evidence.update({
    where: { id: evidence.id },
    data: { disposalStatus: status }
  });
  res.json({
    evidenceId: updated.id,
    commanderApproval,
    prosecutorApproval,
    status
  });
});

app.put('/evidence/:id/dispose', async (req, res) => {
  const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!evidence) {
    res.status(404).json({ message: 'Evidence not found' });
    return;
  }
  const commanderApproval = Boolean(req.body.commanderApproval);
  const prosecutorApproval = Boolean(req.body.prosecutorApproval);
  const status = commanderApproval && prosecutorApproval ? 'disposed' : 'pending_dual_approval';
  const updated = await prisma.evidence.update({
    where: { id: evidence.id },
    data: { disposalStatus: status }
  });
  res.json(updated);
});

app.listen(Number(process.env.PORT ?? 4006), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'evidence-service'} listening on ${process.env.PORT ?? 4006}`);
});
