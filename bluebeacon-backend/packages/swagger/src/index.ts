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

type MergedSpecSource = {
  prefix: string;
  specPath: string | URL;
  tag: string;
};

type MergedDocsOptions = {
  title: string;
  port: number;
  specs: MergedSpecSource[];
  exposeDocs?: DocsExposure;
};

function normalizePath(path: string | URL): string {
  return path instanceof URL ? fileURLToPath(path) : path;
}

function readSpec(path: string | URL): JsonObject {
  const raw = readFileSync(normalizePath(path), 'utf-8');
  return JSON.parse(raw) as JsonObject;
}

function normalizePrefix(prefix: string): string {
  if (!prefix.startsWith('/')) {
    return `/${prefix}`;
  }
  return prefix.endsWith('/') && prefix.length > 1 ? prefix.slice(0, -1) : prefix;
}

const HTTP_VERBS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

/**
 * Swagger UI groups operations by each operation's `tags` array. Top-level `tags` only
 * declares tag metadata; without per-operation tags, everything appears under "default".
 */
function tagPathItemOperations(pathItem: JsonObject, tag: string): JsonObject {
  const out: JsonObject = { ...pathItem };
  for (const verb of HTTP_VERBS) {
    const op = out[verb];
    if (op && typeof op === 'object' && !Array.isArray(op)) {
      out[verb] = { ...(op as JsonObject), tags: [tag] };
    }
  }
  return out;
}

function prefixAndTagPaths(prefix: string, tag: string, paths: JsonObject): JsonObject {
  const out: JsonObject = {};
  const normalizedPrefix = normalizePrefix(prefix);
  for (const [key, value] of Object.entries(paths)) {
    const route = key.startsWith('/') ? key : `/${key}`;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[`${normalizedPrefix}${route}`] = tagPathItemOperations(value as JsonObject, tag);
    }
  }
  return out;
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

export function mountMergedGatewayDocs(app: Express, options: MergedDocsOptions): void {
  const exposure = resolveExposeDocs(options.exposeDocs);
  const guards = docsGuards(exposure);
  const mergedPaths: JsonObject = {};
  const mergedTags = options.specs.map((entry) => ({
    name: entry.tag,
    description: `${entry.tag} domain`
  }));

  for (const specSource of options.specs) {
    const loaded = readSpec(specSource.specPath);
    const paths = ((loaded.paths as JsonObject | undefined) ?? {}) as JsonObject;
    Object.assign(mergedPaths, prefixAndTagPaths(specSource.prefix, specSource.tag, paths));
  }

  const spec = withSharedComponents(
    withServer(
      {
        openapi: '3.1.0',
        info: {
          title: options.title,
          version: '0.1.0'
        },
        tags: mergedTags,
        paths: mergedPaths
      },
      options.port
    )
  );

  app.get('/openapi.json', ...guards, (_req, res) => {
    res.json(spec);
  });
  app.use('/docs', ...guards, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
}
