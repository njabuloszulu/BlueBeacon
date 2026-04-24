/// <reference types="jest" />

import { readFileSync } from 'node:fs';
import path from 'node:path';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const workspaceRoot = process.cwd();
const services = [
  'auth-service',
  'incident-service',
  'case-service',
  'arrest-service',
  'warrant-service',
  'evidence-service',
  'dispatch-service',
  'map-service',
  'notification-service',
  'document-service',
  'admin-service'
] as const;

function toSpecPath(routePath: string): string {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function readJson(pathname: string): Record<string, unknown> {
  return JSON.parse(readFileSync(pathname, 'utf-8')) as Record<string, unknown>;
}

function extractRoutes(source: string): Array<{ method: HttpMethod; path: string }> {
  const results: Array<{ method: HttpMethod; path: string }> = [];
  const routePattern = /app\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  do {
    match = routePattern.exec(source);
    if (match) {
      const method = match[1] as HttpMethod;
      const routePath = match[2] ?? '';
      results.push({ method, path: toSpecPath(routePath) });
    }
  } while (match);

  return results;
}

describe('openapi route coverage', () => {
  for (const service of services) {
    it(`${service} spec includes implemented routes`, () => {
      const appDir = path.join(workspaceRoot, 'apps', service);
      const source = readFileSync(path.join(appDir, 'src', 'index.ts'), 'utf-8');
      const spec = readJson(path.join(appDir, 'openapi.json'));
      const openapi = String(spec.openapi ?? '');
      const paths = (spec.paths as Record<string, Record<string, unknown>> | undefined) ?? {};

      expect(openapi.startsWith('3.')).toBe(true);
      expect(typeof spec.info).toBe('object');
      expect(Object.keys(paths).length).toBeGreaterThan(0);

      const missing: string[] = [];
      for (const route of extractRoutes(source)) {
        if (route.path === '/openapi.json' || route.path.startsWith('/docs')) {
          continue;
        }
        const operation = paths[route.path]?.[route.method];
        if (!operation) {
          missing.push(`${route.method.toUpperCase()} ${route.path}`);
        }
      }

      expect(missing).toEqual([]);
    });
  }
});
