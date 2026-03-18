// ── Mock Data Store ─────────────────────────────
// In-memory data for MVP demo. Replace with Prisma in production.

import { v4 as uuid } from 'uuid';

export interface User {
    id: string;
    mobile: string;
    email?: string;
    fullName?: string;
    dateOfBirth?: string;
    kycStatus: string;
    isActive: boolean;
    createdAt: string;
}

export interface OtpRecord {
    id: string;
    mobile: string;
    otp: string;
    expiresAt: number;
    verified: boolean;
    attempts: number;
}

export interface KycDetail {
    userId: string;
    panNumber?: string;
    panVerified: boolean;
    aadhaarLast4?: string;
    aadhaarVerified: boolean;
    videoKycUrl?: string;
    videoKycStatus: string;
}

export const users = new Map<string, User>();
export const otpStore = new Map<string, OtpRecord>();
export const kycStore = new Map<string, KycDetail>();

// Seed a demo user
const demoUserId = 'usr_demo_001';
users.set(demoUserId, {
    id: demoUserId,
    mobile: '+919876543210',
    email: 'demo@investwise.in',
    fullName: 'Arjun Sharma',
    dateOfBirth: '1992-06-15',
    kycStatus: 'APPROVED',
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
});

kycStore.set(demoUserId, {
    userId: demoUserId,
    panNumber: 'ABCPS1234K',
    panVerified: true,
    aadhaarLast4: '7890',
    aadhaarVerified: true,
    videoKycUrl: 'https://storage.investwise.in/kyc/demo_001.mp4',
    videoKycStatus: 'APPROVED',
});
