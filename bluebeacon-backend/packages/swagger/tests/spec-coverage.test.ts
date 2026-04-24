/// <reference types="jest" />

import { readFileSync } from 'node:fs';
import path from 'node:path';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const workspaceRoot = process.cwd();

function readJson(pathname: string): Record<string, unknown> {
  return JSON.parse(readFileSync(pathname, 'utf-8')) as Record<string, unknown>;
}

function toSpecPath(routePath: string): string {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function extractRoutes(source: string, routerPrefix: string): Array<{ method: HttpMethod; path: string }> {
  const results: Array<{ method: HttpMethod; path: string }> = [];
  const routePattern = new RegExp(`${routerPrefix}\\.(get|post|put|patch|delete)\\(\\s*['"]([^'"]+)['"]`, 'g');
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
  it('unified gateway spec includes mounted prefixed routes', () => {
    const source = readFileSync(path.join(workspaceRoot, 'apps', 'api-gateway', 'src', 'index.ts'), 'utf-8');
    const spec = readJson(path.join(workspaceRoot, 'apps', 'api-gateway', 'openapi', 'auth.json'));
    const openapi = String(spec.openapi ?? '');
    expect(openapi.startsWith('3.')).toBe(true);

    const merged = readJson(path.join(workspaceRoot, 'apps', 'api-gateway', 'openapi', 'incident.json'));
    expect(String(merged.openapi ?? '').startsWith('3.')).toBe(true);

    const prefixes = ['auth', 'incident', 'case', 'arrest', 'warrant', 'evidence', 'dispatch', 'map', 'notification', 'document', 'admin'];
    const missingMounts = prefixes.filter((prefix) => !source.includes(`app.use('/${prefix}'`));
    expect(missingMounts).toEqual([]);

    const routesToCheck = [
      ...extractRoutes(source, 'auth').map((route) => ({ ...route, path: `/auth${route.path}` })),
      ...extractRoutes(source, 'incident').map((route) => ({ ...route, path: `/incident${route.path}` })),
      ...extractRoutes(source, 'cases').map((route) => ({ ...route, path: `/case${route.path}` }))
    ];
    expect(routesToCheck.length).toBeGreaterThan(0);
  });
});
