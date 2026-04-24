import { describe, expect, it } from '@jest/globals';
import { getStationValidationIssue } from './register-route-guards';

describe('getStationValidationIssue', () => {
  it('returns null when station exists', async () => {
    const issue = await getStationValidationIssue('1', async () => ({ id: '1' }));
    expect(issue).toBeNull();
  });

  it('returns stationId issue when station does not exist', async () => {
    const issue = await getStationValidationIssue('999', async () => null);
    expect(issue).toEqual({
      path: ['stationId'],
      message: 'stationId must exist in stations table'
    });
  });
});
