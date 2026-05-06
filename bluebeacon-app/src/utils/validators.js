/* eslint-disable no-control-regex -- RFC 5322 quoted-string grammar */
const RFC_5322_EMAIL_REGEX =
  /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}|\[(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\])$/;

function resolveBirthDate(yy, mm, dd) {
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const now = new Date();
  const currentTwoDigitYear = now.getFullYear() % 100;
  const fullYear = yy <= currentTwoDigitYear ? 2000 + yy : 1900 + yy;
  const date = new Date(Date.UTC(fullYear, mm - 1, dd));
  const isSame =
    date.getUTCFullYear() === fullYear && date.getUTCMonth() === mm - 1 && date.getUTCDate() === dd;
  return isSame ? date : null;
}

function hasValidSaChecksum(idNumber) {
  let oddSum = 0;
  for (let i = 0; i < 12; i += 2) {
    oddSum += Number(idNumber[i]);
  }
  let evenDigits = '';
  for (let i = 1; i < 12; i += 2) {
    evenDigits += idNumber[i];
  }
  const evenValue = Number(evenDigits) * 2;
  const evenSum = String(evenValue)
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
  const total = oddSum + evenSum;
  const checkDigit = (10 - (total % 10)) % 10;
  return checkDigit === Number(idNumber[12]);
}

/** South African ID: 13 digits, valid date + checksum (matches gateway validation). */
export function validateSaId(id) {
  const s = String(id || '').replace(/\s/g, '');
  if (!/^\d{13}$/.test(s)) return false;
  const yy = Number(s.slice(0, 2));
  const mm = Number(s.slice(2, 4));
  const dd = Number(s.slice(4, 6));
  if (!resolveBirthDate(yy, mm, dd)) return false;
  const genderBlock = Number(s.slice(6, 10));
  if (Number.isNaN(genderBlock) || genderBlock < 0 || genderBlock > 9999) return false;
  return hasValidSaChecksum(s);
}

export function validatePhone(phone) {
  const p = String(phone || '').replace(/\s/g, '');
  return /^\+27[6-8]\d{8}$/.test(p);
}

export function validateEmail(email) {
  return RFC_5322_EMAIL_REGEX.test(String(email || '').trim());
}

/** Normalize +27 mobile to 0-prefixed local (for APIs expecting local format). */
/* eslint-enable no-control-regex */

export function phoneToLocal(phone) {
  const p = String(phone || '').replace(/\s/g, '');
  if (p.startsWith('+27')) return `0${p.slice(3)}`;
  return p;
}
