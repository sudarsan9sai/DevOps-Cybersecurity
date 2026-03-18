// ── Idempotency Middleware ───────────────────────
// Reliability: Prevent duplicate orders on retry
// Client sends `Idempotency-Key` header; server caches response

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CachedResponse {
    statusCode: number;
    body: any;
    timestamp: number;
}

// In-memory cache (production: use Redis with TTL)
const idempotencyCache = new Map<string, CachedResponse>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Idempotency middleware for POST endpoints (order placement, payments).
 * Requires `Idempotency-Key` header.
 */
export function idempotencyGuard(req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'POST') return next();

    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
        // Generate one if not provided (for backward compat)
        return next();
    }

    // Validate key format (UUID-like)
    if (!/^[a-zA-Z0-9\-_]{8,64}$/.test(idempotencyKey)) {
        return res.status(400).json({
            success: false,
            error: { message: 'Invalid Idempotency-Key format. Use a UUID or alphanumeric string.' },
        });
    }

    // Scope key to user (if authenticated)
    const userId = (req as any).userId || 'anonymous';
    const cacheKey = `${userId}:${idempotencyKey}`;

    const cached = idempotencyCache.get(cacheKey);
    if (cached) {
        // Return cached response (idempotent replay)
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            res.setHeader('X-Idempotent-Replayed', 'true');
            return res.status(cached.statusCode).json(cached.body);
        }
        // Expired — remove and proceed
        idempotencyCache.delete(cacheKey);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
        idempotencyCache.set(cacheKey, {
            statusCode: res.statusCode,
            body,
            timestamp: Date.now(),
        });
        return originalJson(body);
    };

    next();
}

// ── Cache Cleanup (run periodically) ────────────

setInterval(() => {
    const cutoff = Date.now() - CACHE_TTL;
    for (const [key, value] of idempotencyCache) {
        if (value.timestamp < cutoff) {
            idempotencyCache.delete(key);
        }
    }
}, 60 * 60 * 1000); // Every hour


// ── Device Fingerprinting ───────────────────────
// Fraud detection: track device characteristics

export interface DeviceFingerprint {
    ip: string;
    userAgent: string;
    acceptLanguage?: string;
    screenResolution?: string;
    timezone?: string;
    hash: string;
}

export function extractDeviceFingerprint(req: Request): DeviceFingerprint {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || '';
    const screenResolution = req.headers['x-screen-resolution'] as string || '';
    const timezone = req.headers['x-timezone'] as string || '';

    const rawFingerprint = `${ip}|${userAgent}|${acceptLanguage}|${screenResolution}|${timezone}`;
    const hash = crypto.createHash('sha256').update(rawFingerprint).digest('hex').slice(0, 16);

    return { ip, userAgent, acceptLanguage, screenResolution, timezone, hash };
}
