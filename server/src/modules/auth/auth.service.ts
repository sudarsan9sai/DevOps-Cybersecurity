import { v4 as uuid } from 'uuid';
import { users, otpStore, kycStore, User, OtpRecord } from './auth.data';
import { generateTokens } from '../../common/authGuard';

// ── OTP Service ─────────────────────────────────

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(mobile: string) {
    // Rate check: max 3 OTPs per mobile per 10 minutes
    const existingOtp = Array.from(otpStore.values()).find(
        (o) => o.mobile === mobile && !o.verified && o.expiresAt > Date.now()
    );

    if (existingOtp && existingOtp.attempts >= 3) {
        throw { statusCode: 429, message: 'Too many OTP requests. Try after 10 minutes.' };
    }

    const otp = generateOtp();
    const id = uuid();

    otpStore.set(id, {
        id,
        mobile,
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
        verified: false,
        attempts: (existingOtp?.attempts || 0) + 1,
    });

    // In production: send via Twilio/MSG91
    console.log(`[OTP] Sending ${otp} to ${mobile}`);

    return { otpId: id, message: 'OTP sent successfully', ...(process.env.NODE_ENV === 'development' && { otp }) };
}

export async function verifyOtp(mobile: string, otp: string) {
    const record = Array.from(otpStore.values()).find(
        (o) => o.mobile === mobile && o.otp === otp && !o.verified && o.expiresAt > Date.now()
    );

    if (!record) {
        throw { statusCode: 400, message: 'Invalid or expired OTP' };
    }

    record.verified = true;

    // Find or create user
    let user = Array.from(users.values()).find((u) => u.mobile === mobile);

    if (!user) {
        const id = uuid();
        user = {
            id,
            mobile,
            kycStatus: 'NOT_STARTED',
            isActive: true,
            createdAt: new Date().toISOString(),
        };
        users.set(id, user);
    }

    const tokens = generateTokens(user.id, user.mobile);

    return {
        user: {
            id: user.id,
            mobile: user.mobile,
            fullName: user.fullName,
            email: user.email,
            kycStatus: user.kycStatus,
        },
        ...tokens,
    };
}

export async function getUserProfile(userId: string) {
    const user = users.get(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const kyc = kycStore.get(userId);

    return {
        ...user,
        kyc: kyc
            ? {
                panVerified: kyc.panVerified,
                aadhaarVerified: kyc.aadhaarVerified,
                videoKycStatus: kyc.videoKycStatus,
            }
            : null,
    };
}

// ── KYC Service ─────────────────────────────────

export async function verifyPan(userId: string, panNumber: string) {
    // PAN format validation: ABCPS1234K
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
        throw { statusCode: 400, message: 'Invalid PAN format. Expected: ABCPS1234K' };
    }

    let kyc = kycStore.get(userId);
    if (!kyc) {
        kyc = { userId, panVerified: false, aadhaarVerified: false, videoKycStatus: 'PENDING' };
        kycStore.set(userId, kyc);
    }

    // Mock NSDL/CAMS PAN verification
    kyc.panNumber = panNumber;
    kyc.panVerified = true;

    const user = users.get(userId);
    if (user) user.kycStatus = 'PAN_VERIFIED';

    return { panNumber, verified: true, message: 'PAN verified successfully' };
}

export async function verifyAadhaar(userId: string, aadhaarNumber: string) {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw { statusCode: 400, message: 'Invalid Aadhaar number. Must be 12 digits.' };
    }

    let kyc = kycStore.get(userId);
    if (!kyc) {
        kyc = { userId, panVerified: false, aadhaarVerified: false, videoKycStatus: 'PENDING' };
        kycStore.set(userId, kyc);
    }

    // Mock DigiLocker verification
    kyc.aadhaarLast4 = aadhaarNumber.slice(-4);
    kyc.aadhaarVerified = true;

    const user = users.get(userId);
    if (user) user.kycStatus = 'AADHAAR_VERIFIED';

    return { aadhaarLast4: kyc.aadhaarLast4, verified: true, message: 'Aadhaar verified successfully' };
}

export async function submitVideoKyc(userId: string, videoUrl: string) {
    let kyc = kycStore.get(userId);
    if (!kyc) {
        throw { statusCode: 400, message: 'Complete PAN and Aadhaar verification first' };
    }

    kyc.videoKycUrl = videoUrl;
    kyc.videoKycStatus = 'SUBMITTED';

    const user = users.get(userId);
    if (user) user.kycStatus = 'VIDEO_SUBMITTED';

    // Auto-approve after 2s (mock)
    setTimeout(() => {
        kyc!.videoKycStatus = 'APPROVED';
        if (user) user.kycStatus = 'APPROVED';
    }, 2000);

    return { status: 'SUBMITTED', message: 'Video KYC submitted. Approval in progress.' };
}

export async function getKycStatus(userId: string) {
    const user = users.get(userId);
    const kyc = kycStore.get(userId);

    return {
        overallStatus: user?.kycStatus || 'NOT_STARTED',
        pan: { verified: kyc?.panVerified || false, number: kyc?.panNumber ? `${kyc.panNumber.slice(0, 3)}***${kyc.panNumber.slice(-1)}` : null },
        aadhaar: { verified: kyc?.aadhaarVerified || false, last4: kyc?.aadhaarLast4 || null },
        videoKyc: { status: kyc?.videoKycStatus || 'PENDING' },
    };
}
