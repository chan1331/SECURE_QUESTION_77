import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * Returns a 32-byte buffer key derived from the ENCRYPTION_KEY environment variable.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('ENCRYPTION_KEY environment variable is not defined.');
  }

  // Derive exactly 32 bytes (256 bits) key using SHA-256 of the secret
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedPayload {
  encryptedContent: string; // hex encoded
  iv: string; // hex encoded
}

/**
 * Encrypts plain text content using AES-256-CBC with a cryptographically secure random IV.
 * @param plainText The plain question paper content
 * @returns { encryptedContent, iv } both encoded as hex strings
 */
export function encryptContent(plainText: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16); // 16 bytes IV for AES-CBC

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encryptedContent: encrypted,
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypts AES-256-CBC encrypted content using the provided IV and the server-side ENCRYPTION_KEY.
 * @param encryptedContent hex encoded ciphertext
 * @param iv hex encoded 16-byte initialization vector
 * @returns decrypted plaintext string
 */
export function decryptContent(encryptedContent: string, iv: string): string {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, 'hex');

  if (ivBuffer.length !== 16) {
    throw new Error('Invalid initialization vector length.');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
