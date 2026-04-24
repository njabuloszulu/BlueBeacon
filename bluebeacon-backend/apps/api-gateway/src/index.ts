import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Redis } from 'ioredis';
import { randomUUID } from 'node:crypto';
import { logger, httpLogger } from '@packages/logger';
import { loadEnv } from '@packages/config';
import { authenticateJwt } from '@packages/auth-middleware';
import { mountAggregatorDocs } from '@packages/swagger';

const env = loadEnv();
const app = express();
const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;

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
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});
app.use(limiter);

const sensitiveLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  keyGenerator: (req) => {
    const user = req.headers['x-user-id'];
    return user ? String(user) : ipKeyGenerator(req.ip);
  }
});

const upstream = {
  auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:4001',
  incident: process.env.INCIDENT_SERVICE_URL ?? 'http://localhost:4002',
  case: process.env.CASE_SERVICE_URL ?? 'http://localhost:4003',
  arrest: process.env.ARREST_SERVICE_URL ?? 'http://localhost:4004',
  warrant: process.env.WARRANT_SERVICE_URL ?? 'http://localhost:4005',
  evidence: process.env.EVIDENCE_SERVICE_URL ?? 'http://localhost:4006',
  dispatch: process.env.DISPATCH_SERVICE_URL ?? 'http://localhost:4007',
  map: process.env.MAP_SERVICE_URL ?? 'http://localhost:4008',
  notification: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:4009',
  document: process.env.DOCUMENT_SERVICE_URL ?? 'http://localhost:4010',
  admin: process.env.ADMIN_SERVICE_URL ?? 'http://localhost:4011'
};

for (const [prefix, target] of Object.entries(upstream)) {
  app.use(
    `/${prefix}/openapi.json`,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^/${prefix}`]: '' }
    })
  );
}

mountAggregatorDocs(
  app,
  Object.keys(upstream).map((prefix) => ({
    name: `${prefix}-service`,
    specUrl: `/${prefix}/openapi.json`
  }))
);

for (const [prefix, target] of Object.entries(upstream)) {
  if (!['auth'].includes(prefix)) {
    app.use(`/${prefix}`, authenticateJwt, sensitiveLimiter);
  }
  app.use(`/${prefix}`, createProxyMiddleware({ target, changeOrigin: true, pathRewrite: { [`^/${prefix}`]: '' } }));
}

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'api-gateway', status: 'ok', redis: Boolean(redis) });
});

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `${process.env.SERVICE_NAME ?? 'api-gateway'} listening`);
});
