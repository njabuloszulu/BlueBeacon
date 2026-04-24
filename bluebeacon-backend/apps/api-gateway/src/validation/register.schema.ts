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

export const registerSchema = z.object({
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
  role: z.enum(['civilian', 'officer', 'admin'], {
    error: 'role must be one of civilian, officer, or admin'
  }),
  stationId: z.string().regex(/^\d+$/, 'stationId must be numeric'),
  idNumber: z
    .string()
    .regex(/^\d{13}$/, 'idNumber must be exactly 13 digits')
    .refine((value) => isValidSouthAfricanId(value), 'idNumber must be a valid South African ID number'),
  phone: z
    .string()
    .regex(/^0[678][0-9]{8}$/, 'phone must be a valid South African mobile number')
});

export type RegisterInput = z.infer<typeof registerSchema>;
