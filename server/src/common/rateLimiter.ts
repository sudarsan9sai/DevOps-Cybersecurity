import { Request, Response, NextFunction } from 'express';

// ── Rate Limiting Configuration ─────────────────
// OWASP: Brute force protection
// Auth endpoints: 5 req/min per IP (strict)
// General endpoints: 100 req/min per IP

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    auth: { windowMs: 60 * 1000, maxRequests: 5 },      // 5/min for auth (OWASP brute-force)
    kyc: { windowMs: 60 * 1000, maxRequests: 10 },       // 10/min for KYC
    payment: { windowMs: 60 * 1000, maxRequests: 10 },   // 10/min for payments
    default: { windowMs: 60 * 1000, maxRequests: 100 },   // 100/min general
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitCategory(path: string): string {
    if (path.startsWith('/api/auth')) return 'auth';
    if (path.startsWith('/api/kyc')) return 'kyc';
    if (path.startsWith('/api/payments')) return 'payment';
    return 'default';
}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const category = getRateLimitCategory(req.path);
    const config = RATE_LIMITS[category];
    const key = `${category}:${req.ip || 'unknown'}`;
    const now = Date.now();

    const record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
        requestCounts.set(key, { count: 1, resetTime: now + config.windowMs });
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', config.maxRequests - 1);
        return next();
    }

    const remaining = config.maxRequests - record.count;
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));

    if (record.count >= config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter);

        return res.status(429).json({
            success: false,
            error: {
                message: 'Too many requests. Please try again later.',
                retryAfter,
            },
        });
    }

    record.count++;
    next();
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts) {
        if (now > record.resetTime) {
            requestCounts.delete(key);
        }
    }
}, 5 * 60 * 1000);
