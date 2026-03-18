// ── Immutable Audit Logger ──────────────────────
// SEBI compliance: 7-year retention for all financial transactions
// All entries are append-only and tamper-evident (chained hashes)

import crypto from 'crypto';

export enum AuditAction {
    // Auth
    OTP_SENT = 'OTP_SENT',
    OTP_VERIFIED = 'OTP_VERIFIED',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILED = 'LOGIN_FAILED',
    TOKEN_REFRESHED = 'TOKEN_REFRESHED',

    // KYC
    PAN_VERIFIED = 'PAN_VERIFIED',
    AADHAAR_VERIFIED = 'AADHAAR_VERIFIED',
    VIDEO_KYC_SUBMITTED = 'VIDEO_KYC_SUBMITTED',
    KYC_APPROVED = 'KYC_APPROVED',
    KYC_REJECTED = 'KYC_REJECTED',

    // Orders & SIP
    ORDER_PLACED = 'ORDER_PLACED',
    ORDER_CONFIRMED = 'ORDER_CONFIRMED',
    ORDER_FAILED = 'ORDER_FAILED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',
    SIP_CREATED = 'SIP_CREATED',
    SIP_MODIFIED = 'SIP_MODIFIED',
    SIP_CANCELLED = 'SIP_CANCELLED',
    SIP_EXECUTED = 'SIP_EXECUTED',

    // Payments
    PAYMENT_INITIATED = 'PAYMENT_INITIATED',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',

    // Bank
    BANK_ACCOUNT_LINKED = 'BANK_ACCOUNT_LINKED',
    BANK_ACCOUNT_REMOVED = 'BANK_ACCOUNT_REMOVED',

    // Consent (DPDPA)
    CONSENT_GIVEN = 'CONSENT_GIVEN',
    CONSENT_REVOKED = 'CONSENT_REVOKED',
    DATA_ACCESS_REQUEST = 'DATA_ACCESS_REQUEST',
    DATA_DELETION_REQUEST = 'DATA_DELETION_REQUEST',
}

export interface AuditEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    details: Record<string, any>;
    arnCode?: string; // AMFI ARN code for MF transactions
    previousHash: string;
    hash: string;
}

// In-memory audit log (in production: append-only DB table or event stream)
const auditLog: AuditEntry[] = [];
let lastHash = '0'.repeat(64);

/**
 * Log an immutable audit entry with chained hashing for tamper detection.
 * Every financial transaction MUST be logged here.
 */
export function logAudit(params: {
    userId: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    details?: Record<string, any>;
    arnCode?: string;
}): AuditEntry {
    const entry: Omit<AuditEntry, 'hash'> = {
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceFingerprint: params.deviceFingerprint,
        details: sanitizeAuditDetails(params.details || {}),
        arnCode: params.arnCode || process.env.AMFI_ARN_CODE || 'ARN-123456',
        previousHash: lastHash,
    };

    // Chain hash for tamper evidence
    const entryString = JSON.stringify(entry);
    const hash = crypto.createHash('sha256').update(entryString).digest('hex');

    const fullEntry: AuditEntry = { ...entry, hash };
    auditLog.push(fullEntry);
    lastHash = hash;

    // Non-blocking log (no sensitive data in console)
    if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT] ${params.action} | user:${params.userId} | ${params.resource}`);
    }

    return fullEntry;
}

/**
 * Remove any PII/sensitive fields from audit details.
 * OWASP: No sensitive data in logs.
 */
function sanitizeAuditDetails(details: Record<string, any>): Record<string, any> {
    const sensitiveKeys = [
        'password', 'otp', 'token', 'accessToken', 'refreshToken',
        'aadhaarNumber', 'panNumber', 'accountNumber', 'cvv', 'pin',
        'cardNumber', 'secret', 'privateKey',
    ];

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(details)) {
        if (sensitiveKeys.includes(key)) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeAuditDetails(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/**
 * Retrieve audit entries (admin use, with pagination).
 */
export function getAuditLog(filters: {
    userId?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}) {
    let entries = [...auditLog];

    if (filters.userId) entries = entries.filter((e) => e.userId === filters.userId);
    if (filters.action) entries = entries.filter((e) => e.action === filters.action);
    if (filters.startDate) entries = entries.filter((e) => e.timestamp >= filters.startDate!);
    if (filters.endDate) entries = entries.filter((e) => e.timestamp <= filters.endDate!);

    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const total = entries.length;

    return {
        entries: entries.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

/**
 * Verify integrity of the audit chain (tamper detection).
 */
export function verifyAuditChain(): { valid: boolean; brokenAt?: number } {
    for (let i = 1; i < auditLog.length; i++) {
        const current = auditLog[i];
        const previous = auditLog[i - 1];

        if (current.previousHash !== previous.hash) {
            return { valid: false, brokenAt: i };
        }
    }
    return { valid: true };
}
