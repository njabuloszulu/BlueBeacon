import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { loadEnv } from '@packages/config';
import { logger } from '@packages/logger';
import { emitAuditEvent } from '@packages/audit';
import type { UserRole } from '@packages/types';
import { prisma, appendAuditEvent } from '@packages/db';
import { validateBody } from '@packages/auth-middleware';
import { mountServiceDocs } from '@packages/swagger';
import { z } from 'zod';

const env = loadEnv({
  ...process.env,
  SERVICE_NAME: process.env.SERVICE_NAME ?? 'auth-service',
  PORT: process.env.PORT ?? '4001'
});
const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Auth Service API',
  port: env.PORT
});

const failedAttempts = new Map<string, number>();
const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().min(3),
  stationId: z.string().optional(),
  idNumber: z.string().optional(),
  phone: z.string().optional()
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function signAccessToken(sub: string, role: UserRole, stationId?: string): string {
  return jwt.sign({ sub, role, stationId }, env.JWT_PRIVATE_KEY ?? 'dev-private', {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn']
  } as jwt.SignOptions);
}

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'auth-service', status: 'ok' });
});

app.post('/register', validateBody(registerSchema), async (req, res) => {
  const { fullName, email, password, role, stationId, idNumber, phone } = req.body as {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    stationId?: string;
    idNumber?: string;
    phone?: string;
  };

  if (!fullName || !email || !password || !role) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'Email already in use.' });
    return;
  }

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

  await emitAuditEvent({
    actorId: created.id,
    action: 'auth.register',
    entity: 'user',
    entityId: created.id,
    after: { email, role },
    timestamp: new Date().toISOString()
  });

  await appendAuditEvent({
    actorId: created.id,
    action: 'auth.register',
    entity: 'user',
    entityId: created.id,
    afterState: { email, role, stationId },
    ipAddress: req.ip ?? ''
  });

  res.status(201).json({ id: created.id, email: created.email, role: created.role, stationId: created.stationId });
});

app.post('/verify-identity', async (req, res) => {
  const { userId, idNumber } = req.body as { userId: string; idNumber: string };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const verified = Boolean(idNumber) && user.idNumber === idNumber;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: verified }
  });

  await appendAuditEvent({
    actorId: user.id,
    action: 'auth.verify_identity',
    entity: 'user',
    entityId: user.id,
    beforeState: { isVerified: user.isVerified },
    afterState: { isVerified: updated.isVerified },
    ipAddress: req.ip ?? ''
  });

  res.json({ userId: user.id, isVerified: updated.isVerified });
});

app.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const key = user.id;
  const attempts = failedAttempts.get(key) ?? 0;
  if (attempts >= 5) {
    res.status(423).json({ message: 'Account locked' });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    failedAttempts.set(key, attempts + 1);
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  failedAttempts.set(key, 0);
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

  await emitAuditEvent({
    actorId: user.id,
    action: 'auth.login',
    entity: 'session',
    entityId: refreshToken,
    timestamp: new Date().toISOString()
  });

  await appendAuditEvent({
    actorId: user.id,
    action: 'auth.login',
    entity: 'session',
    entityId: refreshToken,
    afterState: { role: user.role },
    ipAddress: req.ip ?? ''
  });

  res.json({
    accessToken,
    user: { id: user.id, fullName: user.fullName, role: user.role, stationId: user.stationId, isVerified: user.isVerified }
  });
});

app.post('/refresh', async (req, res) => {
  const token = req.cookies.refresh_token as string | undefined;
  if (!token) {
    res.status(401).json({ message: 'Invalid refresh token' });
    return;
  }
  const sessions = await prisma.session.findMany({
    where: {
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
  const session = await (async () => {
    for (const candidate of sessions) {
      if (await bcrypt.compare(token, candidate.refreshHash)) {
        return candidate;
      }
    }
    return null;
  })();
  if (!session) {
    res.status(401).json({ message: 'Invalid refresh token' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const rotated = uuidv4();
  await prisma.session.update({
    where: { id: session.id },
    data: {
      revokedAt: new Date()
    }
  });
  await prisma.session.create({
    data: {
      id: rotated,
      userId: user.id,
      refreshHash: await bcrypt.hash(rotated, 10),
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
    }
  });
  res.cookie('refresh_token', rotated, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
  });
  res.json({ accessToken: signAccessToken(user.id, user.role as UserRole, user.stationId ?? undefined) });
});

app.post('/logout', async (req, res) => {
  const token = req.cookies.refresh_token as string | undefined;
  if (token) {
    const sessions = await prisma.session.findMany({ where: { revokedAt: null } });
    for (const session of sessions) {
      if (await bcrypt.compare(token, session.refreshHash)) {
        await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      }
    }
    res.clearCookie('refresh_token');
  }
  await emitAuditEvent({
    actorId: 'anonymous',
    action: 'auth.logout',
    entity: 'session',
    entityId: token ?? 'none',
    timestamp: new Date().toISOString()
  });

  await appendAuditEvent({
    actorId: 'system',
    action: 'auth.logout',
    entity: 'session',
    entityId: token ?? 'none',
    ipAddress: req.ip ?? ''
  });
  res.status(204).send();
});

app.post('/mfa/otp', async (req, res) => {
  const { phone, userId } = req.body as { phone: string; userId?: string };
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  if (userId) {
    await appendAuditEvent({
      actorId: userId,
      action: 'auth.mfa_otp_requested',
      entity: 'mfa',
      entityId: userId,
      afterState: { phone, otpHint: `${otp.slice(0, 2)}****` },
        ipAddress: req.ip ?? ''
    });
  }
  res.json({ message: 'OTP issued', phone, otpHint: `${otp.slice(0, 2)}****` });
});

app.post('/mfa/verify', async (req, res) => {
  const { userId, otp, hardwareToken, biometricAssertion } = req.body as {
    userId: string;
    otp?: string;
    hardwareToken?: string;
    biometricAssertion?: string;
  };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const requiresStrongFactor = user.role === 'judge';
  const passedOtp = Boolean(otp && otp.length >= 6);
  const passedStrongFactor = Boolean(hardwareToken || biometricAssertion);
  const verified = requiresStrongFactor ? passedOtp && passedStrongFactor : passedOtp;
  res.json({
    userId: user.id,
    verified,
    factor: requiresStrongFactor ? 'otp+strong-factor' : 'otp'
  });
});

app.post('/oauth/token', async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  const user = await prisma.user.findUnique({ where: { email: username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'invalid_grant' });
    return;
  }
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
  res.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 900, refresh_token: refreshToken });
});

app.post('/users/:id/revoke-sessions', async (req, res) => {
  await prisma.session.updateMany({
    where: { userId: req.params.id, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  res.status(204).send();
});

app.post('/users/:id/password', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const nextPassword = String(req.body.password ?? '');
  if (nextPassword.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(nextPassword, 12)
    }
  });
  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  await appendAuditEvent({
    actorId: user.id,
    action: 'auth.password_changed',
    entity: 'user',
    entityId: user.id,
    ipAddress: req.ip ?? ''
  });
  res.status(204).send();
});

app.get('/sar/me', async (req, res) => {
  const id = String(req.query.userId ?? '');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const sessions = await prisma.session.findMany({ where: { userId: user.id } });
  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    stationId: user.stationId,
    sessions: sessions.map((item) => ({ id: item.id, expiresAt: item.expiresAt, revokedAt: item.revokedAt }))
  });
});

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `${process.env.SERVICE_NAME ?? 'auth-service'} listening`);
});
