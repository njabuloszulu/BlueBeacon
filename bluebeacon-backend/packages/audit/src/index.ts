import type { AuditEvent } from '@packages/types';
import { publishEvent } from '@packages/events';

export async function emitAuditEvent(event: AuditEvent): Promise<void> {
  await publishEvent('audit.event', event);
}
