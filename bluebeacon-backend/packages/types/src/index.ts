export type UserRole = 'civilian' | 'officer' | 'judge' | 'prosecutor' | 'admin';

export interface JwtClaims {
  sub: string;
  role: UserRole;
  stationId?: string;
}

export type IncidentStatus = 'pending' | 'assigned' | 'investigating' | 'court_ready' | 'closed' | 'escalated';
export type WarrantStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'expired';
export type BailStatus = 'not_applied' | 'applied' | 'granted' | 'denied' | 'paid';

export interface AuditEvent {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  timestamp: string;
}
