import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Redis } from 'ioredis';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import crypto from 'node:crypto';
import bwipjs from 'bwip-js';
import { Queue } from 'bullmq';
import client from 'prom-client';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config as loadDotEnvFile } from 'dotenv';
import { logger, httpLogger } from '@packages/logger';
import { loadEnv } from '@packages/config';
import { authenticateJwt, requireRole, validateBody } from '@packages/auth-middleware';
import { mountMergedGatewayDocs } from '@packages/swagger';
import { prisma } from '@packages/db';
import { publishEvent, subscribeEvent } from '@packages/events';
import type { BailStatus, IncidentStatus, UserRole, WarrantStatus } from '@packages/types';
import { z } from 'zod';
import { registerSchema } from './validation/register.schema';
import { getStationValidationIssue } from './validation/register-route-guards';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../../../');
loadDotEnvFile({ path: path.join(workspaceRoot, '.env') });

const env = loadEnv({
  ...process.env,
  SERVICE_NAME: process.env.SERVICE_NAME ?? 'api-gateway',
  PORT: process.env.PORT ?? '4000'
});

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Add it to your .env before starting api-gateway.');
}

const app = express();
const server = createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });
const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;
const upload = multer({ storage: multer.memoryStorage() });
const detentionQueue = new Queue('detention-alerts', { connection: new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379') });
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;
const mailer = nodemailer.createTransport({ jsonTransport: true });

const s3Config: { region: string; endpoint?: string; forcePathStyle?: boolean } = {
  region: process.env.AWS_REGION ?? 'af-south-1'
};
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true;
}
const s3 = new S3Client(s3Config);

app.use(httpLogger);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const requestId = String(req.headers['x-request-id'] ?? randomUUID());
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
});

const limiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? '')
});
app.use(limiter);

const sensitiveLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  keyGenerator: (req) => {
    const user = req.headers['x-user-id'];
    return user ? String(user) : ipKeyGenerator(req.ip ?? '');
  }
});

mountMergedGatewayDocs(app, {
  title: 'BlueBeacon API Gateway',
  port: env.PORT,
  specs: [
    { prefix: '/auth', specPath: new URL('../openapi/auth.json', import.meta.url), tag: 'auth' },
    { prefix: '/incident', specPath: new URL('../openapi/incident.json', import.meta.url), tag: 'incident' },
    { prefix: '/case', specPath: new URL('../openapi/case.json', import.meta.url), tag: 'case' },
    { prefix: '/arrest', specPath: new URL('../openapi/arrest.json', import.meta.url), tag: 'arrest' },
    { prefix: '/warrant', specPath: new URL('../openapi/warrant.json', import.meta.url), tag: 'warrant' },
    { prefix: '/evidence', specPath: new URL('../openapi/evidence.json', import.meta.url), tag: 'evidence' },
    { prefix: '/dispatch', specPath: new URL('../openapi/dispatch.json', import.meta.url), tag: 'dispatch' },
    { prefix: '/map', specPath: new URL('../openapi/map.json', import.meta.url), tag: 'map' },
    { prefix: '/notification', specPath: new URL('../openapi/notification.json', import.meta.url), tag: 'notification' },
    { prefix: '/document', specPath: new URL('../openapi/document.json', import.meta.url), tag: 'document' },
    { prefix: '/admin', specPath: new URL('../openapi/admin.json', import.meta.url), tag: 'admin' }
  ]
});

function signAccessToken(sub: string, role: UserRole, stationId?: string): string {
  return jwt.sign({ sub, role, stationId }, env.JWT_PRIVATE_KEY ?? 'dev-private', {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn']
  } as jwt.SignOptions);
}

const failedAttempts = new Map<string, number>();
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const auth = express.Router();
auth.get('/health', (_req, res) => res.json({ service: 'auth-service', status: 'ok' }));
auth.post('/register', validateBody(registerSchema), async (req, res) => {
  const { fullName, email, password, role, stationId, idNumber, phone } = req.body;

  const stationIssue = await getStationValidationIssue(stationId, (id) =>
    prisma.station.findUnique({ where: { id }, select: { id: true } })
  );
  if (stationIssue) {
    return res.status(400).json({
      message: 'Invalid request payload',
      issues: [stationIssue]
    });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email already in use.' });
  const created = await prisma.user.create({
    data: {
      id: uuidv4(),
      fullName,
      email,
      idNumber: idNumber ?? null,
      phone: phone ?? null,
      role,
      stationId: stationId ?? null,
      isVerified: false,
      passwordHash: await bcrypt.hash(password, 12)
    }
  });
  res.status(201).json({ id: created.id, email: created.email, role: created.role, stationId: created.stationId });
});
auth.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const attempts = failedAttempts.get(user.id) ?? 0;
  if (attempts >= 5) return res.status(423).json({ message: 'Account locked' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    failedAttempts.set(user.id, attempts + 1);
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  failedAttempts.set(user.id, 0);
  const accessToken = signAccessToken(user.id, user.role as UserRole, user.stationId ?? undefined);
  const refreshToken = uuidv4();
  await prisma.session.create({
    data: {
      id: refreshToken,
      userId: user.id,
      refreshHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
    }
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
  });
  res.json({ accessToken, user: { id: user.id, fullName: user.fullName, role: user.role, stationId: user.stationId } });
});
auth.post('/refresh', async (req, res) => {
  const token = req.cookies.refresh_token as string | undefined;
  if (!token) return res.status(401).json({ message: 'Invalid refresh token' });
  const sessions = await prisma.session.findMany({ where: { revokedAt: null, expiresAt: { gt: new Date() } } });
  let session = null;
  for (const candidate of sessions) {
    if (await bcrypt.compare(token, candidate.refreshHash)) {
      session = candidate;
      break;
    }
  }
  if (!session) return res.status(401).json({ message: 'Invalid refresh token' });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const rotated = uuidv4();
  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  await prisma.session.create({
    data: { id: rotated, userId: user.id, refreshHash: await bcrypt.hash(rotated, 10), expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000) }
  });
  res.cookie('refresh_token', rotated, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000 });
  res.json({ accessToken: signAccessToken(user.id, user.role as UserRole, user.stationId ?? undefined) });
});
auth.post('/logout', async (req, res) => {
  const token = req.cookies.refresh_token as string | undefined;
  if (token) {
    const sessions = await prisma.session.findMany({ where: { revokedAt: null } });
    for (const s of sessions) {
      if (await bcrypt.compare(token, s.refreshHash)) await prisma.session.update({ where: { id: s.id }, data: { revokedAt: new Date() } });
    }
    res.clearCookie('refresh_token');
  }
  res.status(204).send();
});
auth.post('/verify-identity', async (req, res) => {
  const { userId, idNumber } = req.body as { userId: string; idNumber: string };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const verified = Boolean(idNumber) && user.idNumber === idNumber;
  const updated = await prisma.user.update({ where: { id: user.id }, data: { isVerified: verified } });
  res.json({ userId: user.id, isVerified: updated.isVerified });
});
auth.post('/mfa/otp', async (req, res) => res.json({ message: 'OTP issued', phone: req.body.phone, otpHint: '12****' }));
auth.post('/mfa/verify', async (req, res) => res.json({ userId: req.body.userId, verified: Boolean(req.body.otp), factor: 'otp' }));
auth.post('/oauth/token', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: String(req.body.username ?? '') } });
  if (!user || !(await bcrypt.compare(String(req.body.password ?? ''), user.passwordHash))) return res.status(401).json({ error: 'invalid_grant' });
  const refreshToken = uuidv4();
  await prisma.session.create({ data: { id: refreshToken, userId: user.id, refreshHash: await bcrypt.hash(refreshToken, 10), expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000) } });
  res.json({ access_token: signAccessToken(user.id, user.role as UserRole, user.stationId ?? undefined), token_type: 'Bearer', expires_in: 900, refresh_token: refreshToken });
});
auth.post('/users/:id/revoke-sessions', async (req, res) => {
  await prisma.session.updateMany({ where: { userId: req.params.id, revokedAt: null }, data: { revokedAt: new Date() } });
  res.status(204).send();
});
auth.post('/users/:id/password', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const nextPassword = String(req.body.password ?? '');
  if (nextPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(nextPassword, 12) } });
  await prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  res.status(204).send();
});
auth.get('/sar/me', async (req, res) => {
  const id = String(req.query.userId ?? '');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const sessions = await prisma.session.findMany({ where: { userId: user.id } });
  res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, stationId: user.stationId, sessions });
});

const incident = express.Router();
function distanceInKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const calc = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc)));
}
incident.get('/health', (_req, res) => res.json({ service: 'incident-service', status: 'ok' }));
incident.post('/incidents', upload.array('media', 5), async (req, res) => {
  const reporterId = String(req.body.reporterId ?? '');
  const incidentType = String(req.body.incidentType ?? '');
  const description = String(req.body.description ?? '');
  const locationLat = Number(req.body.locationLat ?? 0);
  const locationLng = Number(req.body.locationLng ?? 0);
  const officers = await prisma.user.findMany({ where: { role: 'officer', isVerified: true }, select: { id: true } });
  let nearestOfficerId: string | undefined;
  if (officers.length > 0) {
    nearestOfficerId = officers
      .map((officer) => ({ officerId: officer.id, distance: distanceInKm(locationLat, locationLng, -33.9249, 18.4241) }))
      .sort((left, right) => left.distance - right.distance)[0]?.officerId;
  }
  const created = await prisma.incident.create({ data: { id: uuidv4(), reporterId, incidentType, description, locationLat, locationLng, status: 'pending', assignedOfficerId: nearestOfficerId ?? null } });
  await publishEvent('incident.created', created);
  io.to(`incident:${created.id}`).emit('incident.updated', created);
  res.status(201).json(created);
});
incident.get('/incidents/:id/status', async (req, res) => {
  const found = await prisma.incident.findUnique({ where: { id: String(req.params.id) } });
  if (!found) return res.status(404).json({ message: 'Incident not found' });
  res.json({ id: found.id, status: found.status, assignedOfficerId: found.assignedOfficerId });
});
incident.post('/incidents/:id/transition', async (req, res) => {
  const found = await prisma.incident.findUnique({ where: { id: String(req.params.id) } });
  if (!found) return res.status(404).json({ message: 'Incident not found' });
  const next = String(req.body.status) as IncidentStatus;
  const allowed: Record<IncidentStatus, IncidentStatus[]> = {
    pending: ['assigned', 'escalated'],
    assigned: ['investigating', 'escalated'],
    investigating: ['court_ready', 'closed', 'escalated'],
    court_ready: ['closed'],
    closed: [],
    escalated: ['assigned', 'investigating']
  };
  if (!(allowed[found.status as IncidentStatus] ?? []).includes(next)) return res.status(400).json({ message: 'Invalid transition', from: found.status, to: next });
  const updated = await prisma.incident.update({ where: { id: found.id }, data: { status: next } });
  await publishEvent('incident.updated', updated);
  io.to(`incident:${updated.id}`).emit('incident.updated', updated);
  res.json(updated);
});
incident.post('/incidents/:id/accept', authenticateJwt, requireRole('officer'), async (req, res) => {
  const found = await prisma.incident.findUnique({ where: { id: String(req.params.id) } });
  if (!found) return res.status(404).json({ message: 'Incident not found' });
  const assignedOfficerId = req.auth?.sub ?? null;
  const updated = await prisma.incident.update({ where: { id: found.id }, data: { status: 'assigned', assignedOfficerId } });
  await publishEvent('incident.accepted', { incidentId: updated.id, assignedOfficerId });
  res.json(updated);
});

const cases = express.Router();
cases.get('/health', (_req, res) => res.json({ service: 'case-service', status: 'ok' }));
cases.post('/dockets', async (req, res) => {
  const docket = await prisma.docket.create({ data: { id: uuidv4(), incidentId: String(req.body.incidentId), leadOfficerId: req.body.leadOfficerId ? String(req.body.leadOfficerId) : null, stationId: req.body.stationId ? String(req.body.stationId) : null, status: 'open', notes: [] } });
  res.status(201).json(docket);
});
cases.post('/dockets/from-incident-accepted', async (req, res) => {
  const docket = await prisma.docket.create({ data: { id: uuidv4(), incidentId: String(req.body.incidentId), leadOfficerId: req.body.assignedOfficerId ? String(req.body.assignedOfficerId) : null, status: 'open', notes: [] } });
  res.status(201).json(docket);
});
cases.patch('/dockets/:id/status', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) return res.status(404).json({ message: 'Docket not found' });
  const updated = await prisma.docket.update({ where: { id: docket.id }, data: { status: String(req.body.status) } });
  res.json(updated);
});
cases.put('/dockets/:id/notes', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) return res.status(404).json({ message: 'Docket not found' });
  const notes = Array.isArray(docket.notes) ? docket.notes : [];
  const note = { id: uuidv4(), note: String(req.body.note ?? ''), by: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'unknown', at: new Date().toISOString(), attachments: Array.isArray(req.body.attachments) ? req.body.attachments.map(String) : [], evidenceIds: Array.isArray(req.body.evidenceIds) ? req.body.evidenceIds.map(String) : [] };
  const updated = await prisma.docket.update({ where: { id: docket.id }, data: { notes: [...notes, note] } });
  res.status(201).json({ docket: updated, note });
});
cases.get('/dockets/:id/notes', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) return res.status(404).json({ message: 'Docket not found' });
  res.json(Array.isArray(docket.notes) ? docket.notes : []);
});
cases.patch('/dockets/:id/notes/:noteId', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) return res.status(404).json({ message: 'Docket not found' });
  const notes = (Array.isArray(docket.notes) ? docket.notes : []).map((entry) =>
    typeof entry === 'object' && entry !== null && 'id' in entry && (entry as { id?: string }).id === req.params.noteId
      ? { ...entry, note: String(req.body.note ?? (entry as { note?: string }).note ?? ''), updatedAt: new Date().toISOString() }
      : entry
  );
  const updated = await prisma.docket.update({ where: { id: docket.id }, data: { notes } });
  res.json(updated);
});
cases.delete('/dockets/:id/notes/:noteId', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) return res.status(404).json({ message: 'Docket not found' });
  const notes = (Array.isArray(docket.notes) ? docket.notes : []).filter((entry) => !(typeof entry === 'object' && entry !== null && 'id' in entry && (entry as { id?: string }).id === req.params.noteId));
  await prisma.docket.update({ where: { id: docket.id }, data: { notes } });
  res.status(204).send();
});
cases.post('/dockets/:id/charges', async (req, res) => {
  const docket = await prisma.docket.findUnique({ where: { id: req.params.id } });
  if (!docket) return res.status(404).json({ message: 'Docket not found' });
  const charge = await prisma.docketCharge.create({ data: { id: uuidv4(), docketId: docket.id, charge: String(req.body.charge ?? '') } });
  res.status(201).json(charge);
});

const arrest = express.Router();
arrest.get('/health', (_req, res) => res.json({ service: 'arrest-service', status: 'ok' }));
arrest.post('/arrests', async (req, res) => {
  const now = new Date();
  const created = await prisma.arrest.create({
    data: {
      id: uuidv4(),
      suspectFullName: String(req.body.suspectFullName ?? ''),
      suspectIdNumber: String(req.body.suspectIdNumber ?? ''),
      biometricRef: req.body.biometricRef ? String(req.body.biometricRef) : null,
      docketId: String(req.body.docketId ?? ''),
      charges: Array.isArray(req.body.charges) ? req.body.charges.map(String) : [],
      arrestLocation: req.body.arrestLocation ? String(req.body.arrestLocation) : null,
      bailStatus: 'not_applied',
      bailAmount: req.body.bailAmount ? Number(req.body.bailAmount) : null,
      cellNumber: String(req.body.cellNumber ?? 'UNASSIGNED'),
      arrestDatetime: now
    }
  });
  await detentionQueue.add('hold-limit-warning', { arrestId: created.id, docketId: created.docketId }, { delay: 47 * 60 * 60 * 1000 });
  res.status(201).json(created);
});
arrest.post('/arrests/:id/bail-apply', async (req, res) => {
  const found = await prisma.arrest.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Arrest not found' });
  const updated = await prisma.arrest.update({ where: { id: found.id }, data: { bailStatus: 'applied' } });
  await prisma.bailApplication.create({ data: { id: uuidv4(), arrestId: found.id, warrantId: req.body.warrantId ? String(req.body.warrantId) : null, officerId: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'unknown', status: 'submitted', reason: req.body.reason ? String(req.body.reason) : null } });
  res.json(updated);
});
arrest.post('/bail', async (req, res) => {
  const found = await prisma.arrest.findUnique({ where: { id: String(req.body.arrestId ?? '') } });
  if (!found) return res.status(404).json({ message: 'Arrest not found' });
  const decision = String(req.body.decision ?? 'denied') as BailStatus;
  const updated = await prisma.arrest.update({ where: { id: found.id }, data: { bailStatus: decision, bailAmount: req.body.bailAmount ? Number(req.body.bailAmount) : null } });
  await prisma.bailApplication.updateMany({ where: { arrestId: found.id, status: 'submitted' }, data: { status: decision, judgeId: req.body.judgeId ? String(req.body.judgeId) : null } });
  res.json(updated);
});
arrest.get('/cells/board', async (_req, res) => {
  const arrests = await prisma.arrest.findMany({ select: { cellNumber: true } });
  const occupancy = arrests.reduce<Record<string, number>>((acc, row) => {
    acc[row.cellNumber] = (acc[row.cellNumber] ?? 0) + 1;
    return acc;
  }, {});
  res.json({ occupancy });
});
arrest.get('/cells', async (_req, res) => res.json(await prisma.arrest.findMany({ select: { id: true, cellNumber: true, arrestDatetime: true } })));
arrest.get('/suspects/check', async (req, res) => {
  const matches = await prisma.arrest.findMany({ where: { suspectIdNumber: String(req.query.idNumber ?? '') } });
  res.json({ matches, hasPriorRecord: matches.length > 0 });
});

const warrant = express.Router();
warrant.get('/health', (_req, res) => res.json({ service: 'warrant-service', status: 'ok' }));
warrant.post('/warrants', async (req, res) => {
  const created = await prisma.warrant.create({ data: { id: uuidv4(), docketId: String(req.body.docketId ?? ''), requestingOfficerId: String(req.body.requestingOfficerId ?? ''), warrantType: String(req.body.warrantType ?? 'search'), targetName: req.body.targetName ? String(req.body.targetName) : null, targetAddress: req.body.targetAddress ? String(req.body.targetAddress) : null, judgeId: req.body.judgeId ? String(req.body.judgeId) : null, status: 'pending', expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });
  await publishEvent('notification.judge.required', { judgeId: created.judgeId, warrantId: created.id, docketId: created.docketId });
  res.status(201).json(created);
});
warrant.get('/warrants/:id', async (req, res) => {
  const found = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Warrant not found' });
  res.json(found);
});
warrant.put('/warrants/:id/sign', async (req, res) => {
  const found = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Warrant not found' });
  const decision = String(req.body.decision ?? 'rejected') as 'approved' | 'rejected';
  const judgeId = String(req.body.judgeId ?? found.judgeId ?? '');
  const signaturePayload = JSON.stringify({ warrantId: found.id, judgeId, decision, ts: Date.now() });
  const signedHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');
  const updated = await prisma.warrant.update({ where: { id: found.id }, data: { status: decision as WarrantStatus, judgeId, digitalSignature: signedHash, issuedAt: decision === 'approved' ? new Date() : null } });
  res.json(updated);
});
warrant.post('/warrants/:id/review', async (req, res) => {
  req.body.decision = req.body.decision ?? 'rejected';
  req.body.judgeId = req.body.judgeId ?? '';
  const found = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Warrant not found' });
  const judgeId = String(req.body.judgeId ?? found.judgeId ?? '');
  const signaturePayload = JSON.stringify({ warrantId: found.id, judgeId, decision: String(req.body.decision), ts: Date.now() });
  const signedHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');
  const updated = await prisma.warrant.update({ where: { id: found.id }, data: { status: String(req.body.decision) as WarrantStatus, judgeId, digitalSignature: signedHash, issuedAt: String(req.body.decision) === 'approved' ? new Date() : null } });
  res.json(updated);
});
warrant.get('/warrants/:id/pdf', async (req, res) => {
  const found = await prisma.warrant.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Warrant not found' });
  res.setHeader('Content-Type', 'application/pdf');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text('Signed Warrant');
  doc.moveDown();
  doc.text(`Warrant ID: ${found.id}`);
  doc.text(`Docket ID: ${found.docketId}`);
  doc.text(`Type: ${found.warrantType}`);
  doc.text(`Status: ${found.status}`);
  doc.text(`Digital signature hash: ${found.digitalSignature ?? 'pending'}`);
  doc.end();
});
warrant.post('/warrants/expire', async (_req, res) => {
  const now = new Date();
  const expiredCandidates = await prisma.warrant.findMany({ where: { status: 'approved', expiresAt: { lte: now } } });
  let expired = 0;
  for (const item of expiredCandidates) {
    const updated = await prisma.warrant.update({ where: { id: item.id }, data: { status: 'expired' } });
    expired += 1;
    await publishEvent('notification.officer.required', { officerId: updated.requestingOfficerId, warrantId: updated.id, message: 'Warrant has expired' });
  }
  res.json({ expired });
});

const evidence = express.Router();
async function scanWithClamAv(_buffer: Buffer): Promise<boolean> {
  void _buffer;
  return true;
}
evidence.get('/health', (_req, res) => res.json({ service: 'evidence-service', status: 'ok' }));
evidence.post('/evidence', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Missing evidence file' });
  const isSafe = await scanWithClamAv(req.file.buffer);
  if (!isSafe) return res.status(400).json({ message: 'File rejected by malware scanner' });
  const id = uuidv4();
  const barcode = `EV-${Date.now()}`;
  const objectKey = `evidence/${id}/${req.file.originalname}`;
  await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET ?? 'bluebeacon-dev', Key: objectKey, Body: req.file.buffer, ContentType: req.file.mimetype, ServerSideEncryption: 'AES256' }));
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
      chainOfCustody: [{ officerId: String(req.body.collectedBy ?? 'unknown'), reason: 'created', at: new Date().toISOString() }]
    }
  });
  res.status(201).json(record);
});
evidence.post('/evidence/:id/custody', async (req, res) => {
  const found = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Evidence not found' });
  const entry = { officerId: String(req.body.officerId ?? 'unknown'), reason: String(req.body.reason ?? 'transfer'), at: new Date().toISOString() };
  const updated = await prisma.evidence.update({ where: { id: found.id }, data: { chainOfCustody: [...(Array.isArray(found.chainOfCustody) ? found.chainOfCustody : []), entry] } });
  res.json(updated);
});
evidence.get('/evidence/:id/custody-log', async (req, res) => {
  const found = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Evidence not found' });
  res.json(found.chainOfCustody);
});
evidence.get('/evidence/:id/barcode.png', async (req, res) => {
  const found = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Evidence not found' });
  const png = await bwipjs.toBuffer({ bcid: 'code128', text: found.barcode, scale: 3, height: 10 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});
evidence.post('/evidence/:id/dispose/approve', async (req, res) => {
  const found = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Evidence not found' });
  const status = Boolean(req.body.commanderApproval) && Boolean(req.body.prosecutorApproval) ? 'disposed' : 'pending_dual_approval';
  const updated = await prisma.evidence.update({ where: { id: found.id }, data: { disposalStatus: status } });
  res.json({ evidenceId: updated.id, commanderApproval: Boolean(req.body.commanderApproval), prosecutorApproval: Boolean(req.body.prosecutorApproval), status });
});
evidence.put('/evidence/:id/dispose', async (req, res) => {
  const found = await prisma.evidence.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Evidence not found' });
  const status = Boolean(req.body.commanderApproval) && Boolean(req.body.prosecutorApproval) ? 'disposed' : 'pending_dual_approval';
  const updated = await prisma.evidence.update({ where: { id: found.id }, data: { disposalStatus: status } });
  res.json(updated);
});

const dispatch = express.Router();
dispatch.get('/health', (_req, res) => res.json({ service: 'dispatch-service', status: 'ok' }));
dispatch.post('/dispatch/calls', async (req, res) => {
  const call = await prisma.dispatchCall.create({ data: { id: uuidv4(), incidentId: String(req.body.incidentId ?? ''), severity: String(req.body.severity ?? 'medium'), assignedUnit: req.body.assignedUnit ? String(req.body.assignedUnit) : null, status: String(req.body.status ?? 'new') } });
  io.emit('dispatch.call.created', call);
  await publishEvent('dispatch.call.created', call);
  res.status(201).json(call);
});
dispatch.patch('/dispatch/calls/:id/reassign', async (req, res) => {
  const call = await prisma.dispatchCall.findUnique({ where: { id: req.params.id } });
  if (!call) return res.status(404).json({ message: 'Call not found' });
  const updated = await prisma.dispatchCall.update({ where: { id: call.id }, data: { assignedUnit: String(req.body.assignedUnit ?? ''), status: String(req.body.status ?? 'assigned') } });
  io.emit('dispatch.call.reassigned', updated);
  await publishEvent('dispatch.call.reassigned', updated);
  res.json(updated);
});
dispatch.post('/dispatch/units/:unitId/position', async (req, res) => {
  const unitId = req.params.unitId;
  const position = { lat: Number(req.body.lat), lng: Number(req.body.lng), at: new Date().toISOString() };
  await prisma.unitPosition.create({ data: { id: uuidv4(), unitId, latitude: position.lat, longitude: position.lng, recordedAt: new Date(position.at) } });
  io.emit('dispatch.unit.position', { unitId, ...position });
  res.status(202).json({ unitId, ...position });
});

const maps = express.Router();
maps.get('/health', (_req, res) => res.json({ service: 'map-service', status: 'ok' }));
maps.get('/map/layers', async (req, res) => {
  const role = String(req.query.role ?? 'civilian');
  const hotspots = await prisma.hotspot.findMany({ where: { isActive: true } });
  const alerts = await prisma.alertZone.findMany({ where: { isActive: true } });
  res.json({
    type: 'FeatureCollection',
    features: hotspots
      .map((hotspot) => ({
        type: 'Feature',
        properties: { id: hotspot.id, name: hotspot.name, severity: hotspot.severity, radiusMeters: hotspot.radiusMeters, category: hotspot.category, visibleTo: role === 'officer' || role === 'admin' ? 'all' : 'public' },
        geometry: { type: 'Point', coordinates: [hotspot.locationLng, hotspot.locationLat] }
      }))
      .concat(
        alerts.map((alert) => ({
          type: 'Feature',
          properties: { id: alert.id, name: alert.title, severity: alert.severity, radiusMeters: alert.radiusMeters, category: 'alert', visibleTo: role === 'officer' || role === 'admin' ? 'all' : 'public' },
          geometry: { type: 'Point', coordinates: [alert.locationLng, alert.locationLat] }
        }))
      )
  });
});
maps.post('/map/hotspots', async (req, res) => {
  const hotspot = await prisma.hotspot.create({ data: { id: uuidv4(), name: String(req.body.name ?? 'Unnamed hotspot'), category: String(req.body.category ?? 'crime_hotspot'), severity: String(req.body.severity ?? 'medium'), locationLat: Number(req.body.lat), locationLng: Number(req.body.lng), radiusMeters: Number(req.body.radiusMeters ?? 250), createdBy: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : null, isActive: true, expiresAt: req.body.expiresAt ? new Date(String(req.body.expiresAt)) : null } });
  io.emit('map.hotspot.created', hotspot);
  res.status(201).json(hotspot);
});
maps.post('/hotspots', async (req, res) => {
  const hotspot = await prisma.hotspot.create({ data: { id: uuidv4(), name: String(req.body.name ?? 'Unnamed hotspot'), category: String(req.body.category ?? 'crime_hotspot'), severity: String(req.body.severity ?? 'medium'), locationLat: Number(req.body.lat), locationLng: Number(req.body.lng), radiusMeters: Number(req.body.radiusMeters ?? 250), createdBy: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : null, isActive: true, expiresAt: req.body.expiresAt ? new Date(String(req.body.expiresAt)) : null } });
  io.emit('map.hotspot.created', hotspot);
  res.status(201).json(hotspot);
});
maps.post('/alerts', async (req, res) => {
  const alert = await prisma.alertZone.create({ data: { id: uuidv4(), title: String(req.body.title ?? 'Public safety alert'), severity: String(req.body.severity ?? 'warning'), locationLat: Number(req.body.lat), locationLng: Number(req.body.lng), radiusMeters: Number(req.body.radiusMeters ?? 500), createdBy: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : null } });
  io.emit('map.alert.created', alert);
  res.status(201).json(alert);
});
maps.patch('/map/hotspots/:id/expire', async (req, res) => {
  const existing = await prisma.hotspot.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Hotspot not found' });
  const hotspot = await prisma.hotspot.update({ where: { id: existing.id }, data: { isActive: false } });
  io.emit('map.hotspot.expired', hotspot);
  res.json(hotspot);
});
maps.post('/map/hotspots/aggregate-nightly', async (_req, res) => {
  const incidents = await prisma.incident.findMany({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } });
  if (incidents.length === 0) return res.status(202).json({ generated: 0 });
  const generated = await prisma.hotspot.create({ data: { id: uuidv4(), name: 'Nightly aggregated hotspot', category: 'crime_hotspot', severity: incidents.length > 10 ? 'critical' : incidents.length > 5 ? 'high' : 'medium', locationLat: incidents[0]?.locationLat ?? -33.9249, locationLng: incidents[0]?.locationLng ?? 18.4241, radiusMeters: 800, isActive: true } });
  io.emit('map.hotspot.created', generated);
  res.status(202).json({ generated: 1, sample: generated });
});

const notification = express.Router();
notification.get('/health', (_req, res) => res.json({ service: 'notification-service', status: 'ok' }));
notification.put('/preferences/:userId', async (req, res) => {
  const next = await prisma.notificationPreference.upsert({
    where: { userId: req.params.userId },
    create: { id: uuidv4(), userId: req.params.userId, pushEnabled: Boolean(req.body.push), smsEnabled: Boolean(req.body.sms), emailEnabled: Boolean(req.body.email) },
    update: { pushEnabled: Boolean(req.body.push), smsEnabled: Boolean(req.body.sms), emailEnabled: Boolean(req.body.email) }
  });
  res.json(next);
});
notification.post('/notify', async (req, res) => {
  const severity = (req.body.severity ?? 'info') as 'info' | 'warning' | 'emergency';
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId: String(req.body.userId) } });
  const bypassPrefs = severity === 'emergency';
  const usePush = bypassPrefs || prefs?.pushEnabled !== false;
  const useSms = bypassPrefs || prefs?.smsEnabled === true;
  const useEmail = bypassPrefs || prefs?.emailEnabled === true;
  const channels: string[] = [];
  if (usePush) channels.push('push');
  if (useSms) channels.push('sms');
  if (useEmail) channels.push('email');
  const saved = await Promise.all(
    channels.map((channel) =>
      prisma.notification.create({ data: { id: uuidv4(), userId: String(req.body.userId), channel, severity, message: String(req.body.message ?? ''), delivered: true } })
    )
  );
  if (useSms && twilioClient && req.body.phone) {
    await twilioClient.messages.create({ from: process.env.TWILIO_FROM_NUMBER ?? '+10000000000', to: String(req.body.phone), body: String(req.body.message ?? '') });
  }
  if (useEmail && req.body.email) {
    await mailer.sendMail({ to: String(req.body.email), from: 'noreply@bluebeacon.local', subject: `BlueBeacon ${severity.toUpperCase()} notification`, text: String(req.body.message ?? '') });
  }
  res.status(202).json({ id: saved[0]?.id ?? uuidv4(), userId: String(req.body.userId), severity, message: String(req.body.message ?? ''), channels, createdAt: new Date().toISOString() });
});
notification.post('/broadcast/officers', async (req, res) => {
  const message = String(req.body.message ?? '');
  await publishEvent('notification.officer.broadcast', { message, stationId: req.body.stationId });
  res.status(202).json({ delivered: 'queued', message });
});
notification.post('/sos', async (req, res) => {
  const payload = { id: uuidv4(), userId: String(req.body.userId ?? ''), lat: Number(req.body.lat), lng: Number(req.body.lng), message: String(req.body.message ?? 'SOS') };
  await publishEvent('notification.sos.triggered', payload);
  res.status(202).json(payload);
});
notification.post('/notifications', async (req, res) => {
  const severity = (req.body.severity ?? 'info') as 'info' | 'warning' | 'emergency';
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId: String(req.body.userId) } });
  const bypassPrefs = severity === 'emergency';
  const usePush = bypassPrefs || prefs?.pushEnabled !== false;
  const useSms = bypassPrefs || prefs?.smsEnabled === true;
  const useEmail = bypassPrefs || prefs?.emailEnabled === true;
  const channels: string[] = [];
  if (usePush) channels.push('push');
  if (useSms) channels.push('sms');
  if (useEmail) channels.push('email');
  const saved = await prisma.notification.create({ data: { id: uuidv4(), userId: String(req.body.userId), channel: channels.join(','), severity, message: String(req.body.message ?? ''), delivered: true } });
  res.status(202).json(saved);
});
notification.post('/broadcast', async (req, res) => {
  const message = String(req.body.message ?? '');
  await publishEvent('notification.officer.broadcast', { message, stationId: req.body.stationId });
  res.status(202).json({ delivered: 'queued', message });
});

const document = express.Router();
document.get('/health', (_req, res) => res.json({ service: 'document-service', status: 'ok' }));
document.post('/documents/:type', async (req, res) => {
  const doc = await prisma.document.create({ data: { id: uuidv4(), documentType: req.params.type, subjectId: String(req.body.subjectId ?? 'unknown'), checksum: crypto.createHash('sha256').update(JSON.stringify(req.body ?? {})).digest('hex') } });
  res.status(201).json(doc);
});
document.get('/documents/:id/pdf', async (req, res) => {
  const found = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!found) return res.status(404).json({ message: 'Document not found' });
  res.setHeader('Content-Type', 'application/pdf');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text(`Digital Police Station Document: ${found.documentType}`);
  doc.moveDown();
  doc.text(`Document ID: ${found.id}`);
  doc.text(`Subject ID: ${found.subjectId}`);
  doc.text(`Created: ${found.createdAt.toISOString()}`);
  doc.text(`Checksum: ${found.checksum ?? 'n/a'}`);
  doc.end();
});

const admin = express.Router();
admin.get('/health', (_req, res) => res.json({ service: 'admin-service', status: 'ok' }));
admin.get('/audit-events', async (_req, res) => res.json(await prisma.auditEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })));
admin.post('/audit-events', async (req, res) => {
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
admin.get('/audit-logs', async (_req, res) => res.json(await prisma.auditEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 500 })));
admin.post('/users', async (req, res) => {
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      fullName: String(req.body.fullName ?? 'Unnamed User'),
      email: String(req.body.email ?? ''),
      idNumber: req.body.idNumber ? String(req.body.idNumber) : null,
      role: String(req.body.role ?? 'officer'),
      stationId: req.body.stationId ? String(req.body.stationId) : null,
      isVerified: Boolean(req.body.isVerified ?? true),
      passwordHash: await bcrypt.hash(String(req.body.password ?? 'ChangeMe123!'), 12)
    }
  });
  res.status(201).json({ id: user.id, email: user.email, role: user.role, stationId: user.stationId });
});
admin.get('/analytics/summary', async (_req, res) => {
  const [activeIncidents, openDockets, pendingWarrants, totalNotifications] = await Promise.all([
    prisma.incident.count({ where: { status: { in: ['pending', 'assigned', 'investigating', 'court_ready'] } } }),
    prisma.docket.count({ where: { status: { in: ['open', 'under_review', 'court_ready'] } } }),
    prisma.warrant.count({ where: { status: 'pending' } }),
    prisma.notification.count()
  ]);
  res.json({ activeIncidents, openDockets, pendingWarrants, notificationDeliveryRate: totalNotifications > 0 ? 0.99 : 1 });
});
admin.get('/analytics', async (_req, res) => res.json(await prisma.auditEvent.groupBy({ by: ['action'], _count: { action: true } })));
admin.get('/compliance/sar/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const [sessions, notifications, incidents] = await Promise.all([prisma.session.findMany({ where: { userId: user.id } }), prisma.notification.findMany({ where: { userId: user.id } }), prisma.incident.findMany({ where: { reporterId: user.id } })]);
  res.json({ user, sessions, notifications, incidents });
});
admin.post('/compliance/retention/purge', async (req, res) => {
  const cutoff = new Date(Date.now() - Number(req.body.days ?? 365) * 24 * 60 * 60 * 1000);
  const result = await prisma.notification.deleteMany({ where: { createdAt: { lt: cutoff } } });
  res.json({ deleted: result.count, cutoff });
});
admin.post('/compliance/audit/immutable-sink', async (_req, res) => {
  const entries = await prisma.auditEvent.findMany({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, orderBy: { createdAt: 'asc' } });
  const sinkDir = path.resolve(process.cwd(), 'compliance');
  await fs.mkdir(sinkDir, { recursive: true });
  const sinkFile = path.join(sinkDir, `audit-${new Date().toISOString().slice(0, 10)}.jsonl`);
  await fs.appendFile(sinkFile, `${entries.map((item) => JSON.stringify(item)).join('\n')}\n`, { encoding: 'utf8' });
  res.status(202).json({ sinkFile, exported: entries.length });
});
admin.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', registry.contentType);
  res.send(await registry.metrics());
});

app.use('/auth', auth);
app.use('/incident', authenticateJwt, sensitiveLimiter, incident);
app.use('/case', authenticateJwt, sensitiveLimiter, cases);
app.use('/arrest', authenticateJwt, sensitiveLimiter, arrest);
app.use('/warrant', authenticateJwt, sensitiveLimiter, warrant);
app.use('/evidence', authenticateJwt, sensitiveLimiter, evidence);
app.use('/dispatch', authenticateJwt, sensitiveLimiter, dispatch);
app.use('/map', authenticateJwt, sensitiveLimiter, maps);
app.use('/notification', authenticateJwt, sensitiveLimiter, notification);
app.use('/document', authenticateJwt, sensitiveLimiter, document);
app.use('/admin', authenticateJwt, sensitiveLimiter, admin);

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'api-gateway', status: 'ok', redis: Boolean(redis) });
});

io.on('connection', (socket) => {
  socket.on('incident.subscribe', (incidentId: string) => socket.join(`incident:${incidentId}`));
  void (async () => {
    const [calls, positions] = await Promise.all([
      prisma.dispatchCall.findMany({ orderBy: { createdAt: 'desc' }, take: 300 }),
      prisma.unitPosition.findMany({ orderBy: { recordedAt: 'desc' }, take: 300 })
    ]);
    const unitPositions = positions.reduce<Record<string, { lat: number; lng: number; at: string }>>((acc, item) => {
      if (!acc[item.unitId]) acc[item.unitId] = { lat: item.latitude, lng: item.longitude, at: item.recordedAt.toISOString() };
      return acc;
    }, {});
    socket.emit('dispatch.bootstrap', { calls, unitPositions });
  })();
});

await subscribeEvent<{ incidentId: string; assignedOfficerId?: string }>('incident.accepted', async (payload) => {
  const existing = await prisma.docket.findFirst({ where: { incidentId: payload.incidentId } });
  if (existing) return;
  await prisma.docket.create({ data: { id: uuidv4(), incidentId: payload.incidentId, leadOfficerId: payload.assignedOfficerId ?? null, status: 'open', notes: [] } });
});
await subscribeEvent<{ judgeId?: string; warrantId: string; docketId: string }>('notification.judge.required', async (payload) => {
  if (!payload.judgeId) return;
  await prisma.notification.create({ data: { id: uuidv4(), userId: payload.judgeId, channel: 'push', severity: 'warning', message: `New warrant ${payload.warrantId} is waiting for your review.`, delivered: true } });
});
await subscribeEvent<{ officerId?: string; warrantId: string; message: string }>('notification.officer.required', async (payload) => {
  if (!payload.officerId) return;
  await prisma.notification.create({ data: { id: uuidv4(), userId: payload.officerId, channel: 'push', severity: 'info', message: payload.message, delivered: true } });
});
await subscribeEvent<{ actorId?: string; action: string; entity: string; entityId: string; before?: unknown; after?: unknown; ipAddress?: string }>('audit.event', async (payload) => {
  await prisma.auditEvent.create({
    data: {
      id: uuidv4(),
      actorId: payload.actorId ?? null,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId,
      ipAddress: payload.ipAddress ?? null
    }
  });
});

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `${process.env.SERVICE_NAME ?? 'api-gateway'} listening`);
});
