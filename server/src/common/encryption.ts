// ── AES-256 Encryption for PII at rest ──────────
// OWASP Cryptographic Failures prevention
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'investwise-dev-encryption-key-32b!',
    'investwise-salt',
    32
);
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export interface EncryptedPayload {
    iv: string;
    data: string;
    tag: string;
}

/**
 * Encrypt PII data (Aadhaar, PAN, bank account numbers) at rest.
 * Uses AES-256-GCM for authenticated encryption.
 */
export function encryptPII(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    const payload: EncryptedPayload = {
        iv: iv.toString('hex'),
        data: encrypted,
        tag: tag.toString('hex'),
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Decrypt PII data.
 */
export function decryptPII(ciphertext: string): string {
    try {
        const payload: EncryptedPayload = JSON.parse(
            Buffer.from(ciphertext, 'base64').toString('utf8')
        );

        const iv = Buffer.from(payload.iv, 'hex');
        const tag = Buffer.from(payload.tag, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(payload.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch {
        throw new Error('Decryption failed — data may be corrupted');
    }
}

/**
 * Mask PII for display (last 4 characters visible).
 * e.g., "ABCPS1234K" → "******234K"
 */
export function maskPII(value: string, visibleChars = 4): string {
    if (value.length <= visibleChars) return value;
    return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

/**
 * Hash sensitive data (irreversible) for comparisons.
 * Use for audit logs where plaintext is not needed.
 */
export function hashSensitive(value: string): string {
    return crypto.createHmac('sha256', KEY).update(value).digest('hex');
}
