import express from 'express';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@packages/db';
import crypto from 'node:crypto';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Document Service API',
  port: Number(process.env.PORT ?? 4010)
});

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'document-service', status: 'ok' });
});

app.post('/documents/:type', async (req, res) => {
  const doc = await prisma.document.create({
    data: {
      id: uuidv4(),
      documentType: req.params.type,
      subjectId: String(req.body.subjectId ?? 'unknown'),
      checksum: crypto.createHash('sha256').update(JSON.stringify(req.body ?? {})).digest('hex')
    }
  });
  res.status(201).json(doc);
});

app.get('/documents/:id/pdf', async (req, res) => {
  const docMeta = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!docMeta) {
    res.status(404).json({ message: 'Document not found' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text(`Digital Police Station Document: ${docMeta.documentType}`);
  doc.moveDown();
  doc.text(`Document ID: ${docMeta.id}`);
  doc.text(`Subject ID: ${docMeta.subjectId}`);
  doc.text(`Created: ${docMeta.createdAt.toISOString()}`);
  doc.text(`Checksum: ${docMeta.checksum ?? 'n/a'}`);
  doc.end();
});

app.listen(Number(process.env.PORT ?? 4010), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'document-service'} listening on ${process.env.PORT ?? 4010}`);
});
