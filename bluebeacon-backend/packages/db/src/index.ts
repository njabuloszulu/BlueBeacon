import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export async function withTransaction<T>(handler: (client: PrismaClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => handler(tx as PrismaClient));
}

export async function appendAuditEvent(input: {
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  beforeState?: unknown;
  afterState?: unknown;
  ipAddress?: string;
}): Promise<void> {
  const data: {
    actorId: string | null;
    action: string;
    entity: string;
    entityId: string;
    ipAddress: string | null;
    beforeState?: object;
    afterState?: object;
  } = {
    actorId: input.actorId ?? null,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    ipAddress: input.ipAddress ?? null
  };
  if (input.beforeState !== undefined) {
    data.beforeState = input.beforeState as object;
  }
  if (input.afterState !== undefined) {
    data.afterState = input.afterState as object;
  }
  await prisma.auditEvent.create({
    data
  });
}
