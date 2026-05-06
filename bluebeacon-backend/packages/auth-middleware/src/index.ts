import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtClaims, UserRole } from '@packages/types';
import type { ZodType } from 'zod';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtClaims;
    }
  }
}

export function authenticateJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  try {
    const secret =
      process.env.JWT_PRIVATE_KEY ?? process.env.JWT_PUBLIC_KEY ?? 'dev-private';
    const claims = jwt.verify(token, secret) as JwtClaims;
    req.auth = claims;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}

export function requireOwnership(ownerIdField: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ownerId = req.params[ownerIdField];
    if (!req.auth || req.auth.sub !== ownerId) {
      res.status(403).json({ message: 'Forbidden: ownership mismatch' });
      return;
    }
    next();
  };
}

export function maskForRole<T extends Record<string, unknown>>(role: UserRole, payload: T): T {
  if (role === 'civilian') {
    const clone = { ...payload };
    delete clone['internalNotes'];
    delete clone['investigatorOnly'];
    return clone as T;
  }
  return payload;
}

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: 'Invalid request payload',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message
        }))
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
