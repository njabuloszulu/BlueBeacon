import { rawApi, getAccessToken } from './api';

export const AuditService = {
  async logFailure({ url, status, message }) {
    try {
      const t = getAccessToken();
      if (!t) return;
      await rawApi.post(
        '/admin/audit-events',
        {
          action: 'api.client_error',
          entity: 'http_request',
          entityId: String(status ?? 'unknown'),
          afterState: { url, message },
        },
        { headers: { Authorization: `Bearer ${t}` } }
      );
    } catch {
      /* ignore */
    }
  },
};
