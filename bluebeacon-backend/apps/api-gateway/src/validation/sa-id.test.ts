import { describe, expect, it } from '@jest/globals';
import { isValidSouthAfricanId } from './sa-id';

describe('isValidSouthAfricanId', () => {
  it('accepts a valid South African ID number', () => {
    expect(isValidSouthAfricanId('0007216162086')).toBe(true);
  });

  it('rejects values that are not 13 digits', () => {
    expect(isValidSouthAfricanId('000721616208')).toBe(false);
    expect(isValidSouthAfricanId('000721616208A')).toBe(false);
  });

  it('rejects invalid date of birth segments', () => {
    expect(isValidSouthAfricanId('0013326162086')).toBe(false);
  });

  it('rejects invalid checksum values', () => {
    expect(isValidSouthAfricanId('0007216162087')).toBe(false);
  });
});
