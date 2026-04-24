const SA_ID_REGEX = /^\d{13}$/;

function resolveBirthDate(yy: number, mm: number, dd: number): Date | null {
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const now = new Date();
  const currentTwoDigitYear = now.getFullYear() % 100;
  const fullYear = yy <= currentTwoDigitYear ? 2000 + yy : 1900 + yy;
  const date = new Date(Date.UTC(fullYear, mm - 1, dd));
  const isSame =
    date.getUTCFullYear() === fullYear && date.getUTCMonth() === mm - 1 && date.getUTCDate() === dd;
  return isSame ? date : null;
}

function hasValidChecksum(idNumber: string): boolean {
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

export function isValidSouthAfricanId(idNumber: string): boolean {
  if (!SA_ID_REGEX.test(idNumber)) return false;

  const yy = Number(idNumber.slice(0, 2));
  const mm = Number(idNumber.slice(2, 4));
  const dd = Number(idNumber.slice(4, 6));
  if (!resolveBirthDate(yy, mm, dd)) return false;

  const genderBlock = Number(idNumber.slice(6, 10));
  if (Number.isNaN(genderBlock) || genderBlock < 0 || genderBlock > 9999) return false;

  return hasValidChecksum(idNumber);
}
