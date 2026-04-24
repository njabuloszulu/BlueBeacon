export type ValidationIssue = {
  path: Array<string | number>;
  message: string;
};

export async function getStationValidationIssue(
  stationId: string,
  stationLookup: (id: string) => Promise<{ id: string } | null>
): Promise<ValidationIssue | null> {
  const station = await stationLookup(stationId);
  if (!station) {
    return {
      path: ['stationId'],
      message: 'stationId must exist in stations table'
    };
  }

  return null;
}
