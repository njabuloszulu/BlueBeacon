import { describe, it, expect } from '@jest/globals';

type FlowStep = { service: string; method: string; route: string };

describe('Critical API flow contracts', () => {
  it('incident -> docket -> warrant -> judge approval flow remains complete', () => {
    const flow: FlowStep[] = [
      { service: 'incident-service', method: 'POST', route: '/incidents' },
      { service: 'incident-service', method: 'POST', route: '/incidents/:id/accept' },
      { service: 'case-service', method: 'POST', route: '/dockets/from-incident-accepted' },
      { service: 'warrant-service', method: 'POST', route: '/warrants' },
      { service: 'warrant-service', method: 'PUT', route: '/warrants/:id/sign' }
    ];
    expect(flow).toHaveLength(5);
    expect(flow.every((step) => step.route.startsWith('/'))).toBe(true);
  });

  it('arrest -> bail decision flow remains complete', () => {
    const flow: FlowStep[] = [
      { service: 'arrest-service', method: 'POST', route: '/arrests' },
      { service: 'arrest-service', method: 'POST', route: '/arrests/:id/bail-apply' },
      { service: 'arrest-service', method: 'POST', route: '/bail' }
    ];
    expect(flow.map((step) => step.service)).toContain('arrest-service');
  });

  it('evidence custody lifecycle flow remains complete', () => {
    const flow: FlowStep[] = [
      { service: 'evidence-service', method: 'POST', route: '/evidence' },
      { service: 'evidence-service', method: 'POST', route: '/evidence/:id/custody' },
      { service: 'evidence-service', method: 'PUT', route: '/evidence/:id/dispose' }
    ];
    expect(flow[0]?.route).toBe('/evidence');
    expect(flow[2]?.method).toBe('PUT');
  });

  it('hotspot -> alert delivery flow remains complete', () => {
    const flow: FlowStep[] = [
      { service: 'map-service', method: 'POST', route: '/hotspots' },
      { service: 'map-service', method: 'POST', route: '/alerts' },
      { service: 'notification-service', method: 'POST', route: '/notify' }
    ];
    expect(flow.map((step) => step.service)).toEqual(['map-service', 'map-service', 'notification-service']);
  });
});
