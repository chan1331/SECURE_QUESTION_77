import crypto from 'crypto';

/**
 * Computes SHA-256 hash of the input string and returns lowercase hex digest.
 */
export function generateHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Verifies if the computed SHA-256 hash of the content matches the expected hash.
 * Uses timingSafeEqual to avoid timing attack leakage.
 */
export function verifyHash(content: string, expectedHash: string): boolean {
  if (!content || !expectedHash) return false;
  const actualHash = generateHash(content);

  const actualBuf = Buffer.from(actualHash, 'hex');
  const expectedBuf = Buffer.from(expectedHash, 'hex');

  if (actualBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}
