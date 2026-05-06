import { z } from 'zod';
import { isValidSouthAfricanId } from './sa-id';

const RFC_5322_EMAIL_REGEX =
  /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}|\[(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\])$/;

const disposableDomains = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'yopmail.com'
]);

const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const saPhone = z.union([
  z.string().regex(/^0[678][0-9]{8}$/, 'phone must be a valid South African mobile number'),
  z.string().regex(/^\+27[6-8][0-9]{8}$/, 'phone must use +27 country code with valid mobile prefix')
]);

const basePerson = {
  fullName: z
    .string()
    .trim()
    .min(2, 'fullName must be at least 2 characters long')
    .max(50, 'fullName must be at most 50 characters long')
    .regex(/^[A-Za-z ]+$/, 'fullName must contain only alphabetic characters and spaces'),
  email: z
    .string()
    .trim()
    .regex(RFC_5322_EMAIL_REGEX, 'email must be a valid RFC 5322 email address')
    .refine((value) => {
      const [, domain = ''] = value.toLowerCase().split('@');
      return !disposableDomains.has(domain);
    }, 'Disposable email addresses are not allowed'),
  password: z
    .string()
    .min(8, 'password must be at least 8 characters long')
    .regex(
      passwordComplexityRegex,
      'password must include uppercase, lowercase, number, and special character'
    ),
  idNumber: z
    .string()
    .regex(/^\d{13}$/, 'idNumber must be exactly 13 digits')
    .refine((value) => isValidSouthAfricanId(value), 'idNumber must be a valid South African ID number'),
  phone: saPhone
};

const civilianRegister = z.object({
  ...basePerson,
  role: z.literal('civilian'),
  stationId: z.string().regex(/^\d+$/).optional()
});

const judgeRegister = z.object({
  ...basePerson,
  role: z.literal('judge'),
  stationId: z.string().regex(/^\d+$/).optional()
});

const officerRegister = z.object({
  ...basePerson,
  role: z.literal('officer'),
  stationId: z.string().regex(/^\d+$/, 'stationId must be numeric')
});

const adminRegister = z.object({
  ...basePerson,
  role: z.literal('admin'),
  stationId: z.string().regex(/^\d+$/, 'stationId must be numeric')
});

export const registerSchema = z.discriminatedUnion('role', [
  civilianRegister,
  judgeRegister,
  officerRegister,
  adminRegister
]);

export type RegisterInput = z.infer<typeof registerSchema>;
