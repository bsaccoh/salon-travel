import { randomBytes } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const REFERENCE_LENGTH = 6;

export function generateBookingReference(): string {
  const bytes = randomBytes(REFERENCE_LENGTH);
  let result = 'ST-';
  for (let i = 0; i < REFERENCE_LENGTH; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}
