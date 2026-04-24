import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Express, RequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';
import { authenticateJwt, requireRole } from '@packages/auth-middleware';
import { withSharedComponents, type JsonObject } from './common.js';

type DocsExposure = 'public' | 'protected';

type ServiceDocsOptions = {
  specPath: string | URL;
  title: string;
  port: number;
  exposeDocs?: DocsExposure;
};

type GatewayServiceSpec = {
  name: string;
  specUrl: string;
};

function normalizePath(path: string | URL): string {
  return path instanceof URL ? fileURLToPath(path) : path;
}

function readSpec(path: string | URL): JsonObject {
  const raw = readFileSync(normalizePath(path), 'utf-8');
  return JSON.parse(raw) as JsonObject;
}

function resolveExposeDocs(input?: DocsExposure): DocsExposure {
  if (input) {
    return input;
  }
  return process.env.EXPOSE_DOCS === 'protected' ? 'protected' : 'public';
}

function docsGuards(exposure: DocsExposure): RequestHandler[] {
  if (exposure !== 'protected') {
    return [];
  }
  return [authenticateJwt, requireRole('admin')];
}

function withServer(spec: JsonObject, port: number): JsonObject {
  const servers = [
    {
      url: `http://localhost:${port}`
    }
  ];
  return { ...spec, servers };
}

export function mountServiceDocs(app: Express, options: ServiceDocsOptions): void {
  const exposure = resolveExposeDocs(options.exposeDocs);
  const guards = docsGuards(exposure);
  const loaded = readSpec(options.specPath);
  const spec = withSharedComponents(
    withServer(
      {
        ...loaded,
        info: {
          version: '0.1.0',
          ...(loaded.info as JsonObject | undefined),
          title: options.title
        }
      },
      options.port
    )
  );

  app.get('/openapi.json', ...guards, (_req, res) => {
    res.json(spec);
  });
  app.use('/docs', ...guards, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
}

export function mountAggregatorDocs(
  app: Express,
  services: GatewayServiceSpec[],
  exposeDocs?: DocsExposure
): void {
  const exposure = resolveExposeDocs(exposeDocs);
  const guards = docsGuards(exposure);
  const urls = services.map((service) => ({
    name: service.name,
    url: service.specUrl
  }));

  app.get('/openapi.json', ...guards, (_req, res) => {
    res.json({
      openapi: '3.1.0',
      info: {
        title: 'BlueBeacon API Gateway',
        version: '0.1.0'
      },
      paths: {}
    });
  });

  app.use(
    '/docs',
    ...guards,
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      explorer: true,
      swaggerOptions: { urls }
    })
  );
}
