// ── DPDPA 2023 Consent Management ───────────────
// India Digital Personal Data Protection Act compliance
// Track user consent for data processing purposes

import { v4 as uuid } from 'uuid';
import { logAudit, AuditAction } from './auditLogger';

export enum ConsentPurpose {
    KYC_PROCESSING = 'KYC_PROCESSING',
    INVESTMENT_SERVICES = 'INVESTMENT_SERVICES',
    PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
    MARKETING_COMMS = 'MARKETING_COMMS',
    ANALYTICS = 'ANALYTICS',
    THIRD_PARTY_SHARING = 'THIRD_PARTY_SHARING',
    DATA_RETENTION_7Y = 'DATA_RETENTION_7Y', // SEBI mandate
}

export interface ConsentRecord {
    id: string;
    userId: string;
    purpose: ConsentPurpose;
    granted: boolean;
    grantedAt?: string;
    revokedAt?: string;
    version: string; // Consent policy version
    ipAddress?: string;
}

// In-memory consent store
const consentStore = new Map<string, ConsentRecord[]>();

// Mandatory consents (cannot use platform without these)
const MANDATORY_CONSENTS: ConsentPurpose[] = [
    ConsentPurpose.KYC_PROCESSING,
    ConsentPurpose.INVESTMENT_SERVICES,
    ConsentPurpose.PAYMENT_PROCESSING,
    ConsentPurpose.DATA_RETENTION_7Y,
];

/**
 * Record user consent for a specific purpose.
 */
export function grantConsent(
    userId: string,
    purpose: ConsentPurpose,
    ipAddress?: string
): ConsentRecord {
    const consents = consentStore.get(userId) || [];

    const existing = consents.find((c) => c.purpose === purpose);
    if (existing) {
        existing.granted = true;
        existing.grantedAt = new Date().toISOString();
        existing.revokedAt = undefined;

        logAudit({
            userId,
            action: AuditAction.CONSENT_GIVEN,
            resource: 'consent',
            details: { purpose, renewed: true },
            ipAddress,
        });

        return existing;
    }

    const record: ConsentRecord = {
        id: uuid(),
        userId,
        purpose,
        granted: true,
        grantedAt: new Date().toISOString(),
        version: '1.0',
        ipAddress,
    };

    consents.push(record);
    consentStore.set(userId, consents);

    logAudit({
        userId,
        action: AuditAction.CONSENT_GIVEN,
        resource: 'consent',
        details: { purpose },
        ipAddress,
    });

    return record;
}

/**
 * Revoke consent for a specific purpose.
 * Mandatory consents cannot be revoked (leads to account restriction).
 */
export function revokeConsent(
    userId: string,
    purpose: ConsentPurpose,
    ipAddress?: string
): { success: boolean; message: string } {
    if (MANDATORY_CONSENTS.includes(purpose)) {
        return {
            success: false,
            message: `Consent for "${purpose}" is required by regulation. Revoking will restrict your account.`,
        };
    }

    const consents = consentStore.get(userId) || [];
    const existing = consents.find((c) => c.purpose === purpose);

    if (existing) {
        existing.granted = false;
        existing.revokedAt = new Date().toISOString();
    }

    logAudit({
        userId,
        action: AuditAction.CONSENT_REVOKED,
        resource: 'consent',
        details: { purpose },
        ipAddress,
    });

    return { success: true, message: `Consent for "${purpose}" has been revoked.` };
}

/**
 * Get all consents for a user.
 */
export function getUserConsents(userId: string): ConsentRecord[] {
    return consentStore.get(userId) || [];
}

/**
 * Check if user has mandatory consents.
 */
export function hasMandatoryConsents(userId: string): boolean {
    const consents = consentStore.get(userId) || [];
    return MANDATORY_CONSENTS.every((purpose) =>
        consents.some((c) => c.purpose === purpose && c.granted)
    );
}

/**
 * Grant all mandatory consents at registration.
 */
export function grantMandatoryConsents(userId: string, ipAddress?: string): void {
    for (const purpose of MANDATORY_CONSENTS) {
        grantConsent(userId, purpose, ipAddress);
    }
}

/**
 * Handle data access request (DPDPA right to access).
 */
export function requestDataAccess(userId: string, ipAddress?: string) {
    logAudit({
        userId,
        action: AuditAction.DATA_ACCESS_REQUEST,
        resource: 'user_data',
        details: { requestType: 'DPDPA_DATA_ACCESS' },
        ipAddress,
    });

    return {
        requestId: uuid(),
        status: 'PROCESSING',
        message: 'Your data access request has been received. You will receive your data within 72 hours.',
    };
}

/**
 * Handle data deletion request (DPDPA right to erasure).
 * Note: Financial data subject to SEBI 7-year retention cannot be deleted.
 */
export function requestDataDeletion(userId: string, ipAddress?: string) {
    logAudit({
        userId,
        action: AuditAction.DATA_DELETION_REQUEST,
        resource: 'user_data',
        details: { requestType: 'DPDPA_DATA_DELETION' },
        ipAddress,
    });

    return {
        requestId: uuid(),
        status: 'PROCESSING',
        message: 'Data deletion request received. Note: Financial transaction records are retained for 7 years per SEBI regulations.',
        retainedData: ['Transaction history', 'Audit logs', 'KYC records'],
        deletedData: ['Profile preferences', 'Watchlists', 'Marketing data'],
    };
}
