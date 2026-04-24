import { describe, expect, it } from '@jest/globals';
import { registerSchema } from './register.schema';

const validPayload = {
  fullName: 'Wongani skosana',
  email: 'wonganiskosana@gmail.com',
  password: 'P@ssw0rd',
  role: 'civilian',
  stationId: '1',
  idNumber: '0007216162086',
  phone: '0656183117'
} as const;

describe('registerSchema', () => {
  it('accepts a valid payload', () => {
    const result = registerSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  describe('fullName', () => {
    it('rejects names shorter than 2 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, fullName: 'A' });
      expect(result.success).toBe(false);
    });

    it('rejects names with non-alphabetic characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, fullName: 'John3 Doe' });
      expect(result.success).toBe(false);
    });
  });

  describe('email', () => {
    it('rejects malformed email', () => {
      const result = registerSchema.safeParse({ ...validPayload, email: 'bad@' });
      expect(result.success).toBe(false);
    });

    it('rejects disposable email domains', () => {
      const result = registerSchema.safeParse({ ...validPayload, email: 'user@mailinator.com' });
      expect(result.success).toBe(false);
    });
  });

  describe('password', () => {
    it('rejects password without uppercase', () => {
      const result = registerSchema.safeParse({ ...validPayload, password: 'p@ssw0rd' });
      expect(result.success).toBe(false);
    });

    it('rejects password without special character', () => {
      const result = registerSchema.safeParse({ ...validPayload, password: 'Passw0rd' });
      expect(result.success).toBe(false);
    });
  });

  describe('role', () => {
    it('rejects role outside enum', () => {
      const result = registerSchema.safeParse({ ...validPayload, role: 'guest' });
      expect(result.success).toBe(false);
    });
  });

  describe('stationId', () => {
    it('rejects non-numeric stationId', () => {
      const result = registerSchema.safeParse({ ...validPayload, stationId: 'station-1' });
      expect(result.success).toBe(false);
    });
  });

  describe('idNumber', () => {
    it('rejects invalid id checksum', () => {
      const result = registerSchema.safeParse({ ...validPayload, idNumber: '0007216162087' });
      expect(result.success).toBe(false);
    });
  });

  describe('phone', () => {
    it('rejects number with invalid prefix', () => {
      const result = registerSchema.safeParse({ ...validPayload, phone: '0956183117' });
      expect(result.success).toBe(false);
    });
  });
});
