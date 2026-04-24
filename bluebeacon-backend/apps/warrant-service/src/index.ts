import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { WarrantStatus } from '@packages/types';
import PDFDocument from 'pdfkit';
import { publishEvent } from '@packages/events';
import { appendAuditEvent, prisma } from '@packages/db';
import crypto from 'node:crypto';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Warrant Service API',
  port: Number(process.env.PORT ?? 4005)
});

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'warrant-service', status: 'ok' });
});

app.post('/warrants', async (req, res) => {
  const warrant = await prisma.warrant.create({
    data: {
      id: uuidv4(),
      docketId: String(req.body.docketId ?? ''),
      requestingOfficerId: String(req.body.requestingOfficerId ?? ''),
      warrantType: String(req.body.warrantType ?? 'search'),
      targetName: req.body.targetName ? String(req.body.targetName) : null,
      targetAddress: req.body.targetAddress ? String(req.body.targetAddress) : null,
      judgeId: req.body.judgeId ? String(req.body.judgeId) : null,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
    }
  });

  await appendAuditEvent({
    actorId: warrant.requestingOfficerId,
    action: 'warrant.submit',
    entity: 'warrant',
    entityId: warrant.id,
    afterState: warrant,
    ipAddress: req.ip ?? ''
  });
  await publishEvent('warrant.submitted', warrant);
  await publishEvent('notification.judge.required', {
    judgeId: warrant.judgeId,
    warrantId: warrant.id,
    docketId: warrant.docketId
  });
  res.status(201).json(warrant);
});

app.get('/warrants/:id', async (req, res) => {
  const warrant = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!warrant) {
    res.status(404).json({ message: 'Warrant not found' });
    return;
  }
  res.json(warrant);
});

app.put('/warrants/:id/sign', async (req, res) => {
  const warrant = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!warrant) {
    res.status(404).json({ message: 'Warrant not found' });
    return;
  }
  const decision = String(req.body.decision ?? 'rejected') as 'approved' | 'rejected';
  const judgeId = String(req.body.judgeId ?? warrant.judgeId ?? '');
  const signaturePayload = JSON.stringify({
    warrantId: warrant.id,
    judgeId,
    decision,
    ts: Date.now()
  });
  const signedHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');

  const updated = await prisma.warrant.update({
    where: { id: warrant.id },
    data: {
      status: decision as WarrantStatus,
      judgeId,
      digitalSignature: signedHash,
      issuedAt: decision === 'approved' ? new Date() : null
    }
  });
  await publishEvent('warrant.reviewed', updated);
  res.json(updated);
});

app.post('/warrants/:id/review', async (req, res) => {
  req.body.decision = req.body.decision ?? 'rejected';
  req.body.judgeId = req.body.judgeId ?? '';
  // Backward compatible alias to /warrants/:id/sign
  const next = String(req.body.decision) as 'approved' | 'rejected';
  const warrant = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!warrant) {
    res.status(404).json({ message: 'Warrant not found' });
    return;
  }
  const judgeId = String(req.body.judgeId ?? warrant.judgeId ?? '');
  const signaturePayload = JSON.stringify({ warrantId: warrant.id, judgeId, decision: next, ts: Date.now() });
  const signedHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');
  const updated = await prisma.warrant.update({
    where: { id: warrant.id },
    data: {
      status: next as WarrantStatus,
      judgeId,
      digitalSignature: signedHash,
      issuedAt: next === 'approved' ? new Date() : null
    }
  });
  await publishEvent('warrant.reviewed', updated);
  res.json(updated);
});

app.get('/warrants/:id/pdf', async (req, res) => {
  const warrant = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!warrant) {
    res.status(404).json({ message: 'Warrant not found' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text('Signed Warrant');
  doc.moveDown();
  doc.text(`Warrant ID: ${warrant.id}`);
  doc.text(`Docket ID: ${warrant.docketId}`);
  doc.text(`Type: ${warrant.warrantType}`);
  doc.text(`Status: ${warrant.status}`);
  doc.text(`Digital signature hash: ${warrant.digitalSignature ?? 'pending'}`);
  doc.text(`Certificate: ${process.env.JUDGE_CERT_ID ?? 'local-dev-certificate'}`);
  doc.end();
});

app.post('/warrants/expire', async (_req, res) => {
  const now = new Date();
  const expiredCandidates = await prisma.warrant.findMany({
    where: {
      status: 'approved',
      expiresAt: { lte: now }
    }
  });
  let expiredCount = 0;
  for (const warrant of expiredCandidates) {
    const updated = await prisma.warrant.update({
      where: { id: warrant.id },
      data: { status: 'expired' }
    });
    expiredCount += 1;
    await publishEvent('warrant.expired', updated);
    await publishEvent('notification.officer.required', {
      officerId: updated.requestingOfficerId,
      warrantId: updated.id,
      message: 'Warrant has expired'
    });
  }
  res.json({ expired: expiredCount });
});

app.listen(Number(process.env.PORT ?? 4005), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'warrant-service'} listening on ${process.env.PORT ?? 4005}`);
});
