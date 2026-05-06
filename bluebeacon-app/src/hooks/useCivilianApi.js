import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { subscribeIncidentUpdates } from '../services/websocket';

const PAYFAST_BASE =
  import.meta.env.VITE_PAYFAST_SANDBOX_URL || 'https://sandbox.payfast.co.za/eng/process';

export function buildPayfastFineUrl({ reference, amount, itemName }) {
  const q = new URLSearchParams({
    m_payment_id: reference,
    amount: String(amount),
    item_name: itemName || 'Traffic fine payment',
  });
  return `${PAYFAST_BASE}?${q.toString()}`;
}

export function useSubmitIncident() {
  const submitIncident = useCallback(async (formData) => {
    const { data } = await api.post('/incident/incidents', formData);
    return data;
  }, []);
  return { submitIncident };
}

export function useMyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/incident/incidents', { params: { owner: 'me' } });
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { reports, loading, error, reload };
}

export function useIncidentStatus(incidentId) {
  const [statusPayload, setStatusPayload] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatusPayload(null);
  }, [incidentId]);

  const load = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/incident/incidents/${incidentId}/status`);
      setStatusPayload(data);
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!incidentId) return undefined;
    const unsub = subscribeIncidentUpdates(incidentId, () => {
      void load();
    });
    return unsub;
  }, [incidentId, load]);

  return { statusPayload, loading, reload: load };
}

export function useMapLayers() {
  const [geojson, setGeojson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/map/map/layers', { params: { role: 'civilian' } });
      setGeojson(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { geojson, loading, error, reload: load };
}

function timeAgo(value) {
  const ts = value ? new Date(value).getTime() : NaN;
  if (!Number.isFinite(ts)) return 'recent';
  const deltaMinutes = Math.max(1, Math.floor((Date.now() - ts) / 60000));
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d ago`;
}

export function useDashboardAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/map/map/layers', { params: { role: 'civilian' } });
      const features = Array.isArray(data?.features) ? data.features : [];
      const nextAlerts = features
        .filter((feature) => feature?.properties?.category === 'alert')
        .map((feature, index) => {
          const props = feature.properties ?? {};
          return {
            id: props.id || `alert-${index}`,
            severity: String(props.severity || '').toLowerCase(),
            title: props.name || 'Area safety alert',
            sub: props.description || props.detail || props.area || 'Nearby incident reported',
            time: timeAgo(props.createdAt || props.updatedAt || props.timestamp),
          };
        });
      setAlerts(nextAlerts);
    } catch (e) {
      setError(e);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { alerts, loading, error, reload: load };
}

export function useSubmitClearance() {
  const submitClearance = useCallback(async (body) => {
    const { data } = await api.post('/document/documents/clearance', body);
    return data;
  }, []);
  return { submitClearance };
}

export function useSos() {
  const sendSos = useCallback(async (formData) => {
    const { data } = await api.post('/alerts/sos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }, []);
  return { sendSos };
}

export function useNotificationPreferences(userId) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/notification/preferences/${userId}`);
      setPrefs(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (next) => {
      const { data } = await api.put(`/notification/preferences/${userId}`, next);
      setPrefs(data);
      return data;
    },
    [userId]
  );

  return { prefs, loading, reload: load, save };
}
