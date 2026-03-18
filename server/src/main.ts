import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

import { authRouter } from './modules/auth/auth.routes';
import { kycRouter } from './modules/auth/kyc.routes';
import { fundsRouter } from './modules/funds/funds.routes';
import { portfolioRouter } from './modules/portfolio/portfolio.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { watchlistRouter } from './modules/watchlist/watchlist.routes';
import { discoverRouter } from './modules/watchlist/watchlist.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { errorHandler } from './common/errorHandler';
import { rateLimiter } from './common/rateLimiter';
import { idempotencyGuard } from './common/idempotency';
import { bseStarMFBreaker, razorpayBreaker, digiLockerBreaker } from './common/circuitBreaker';
import { verifyAuditChain } from './common/auditLogger';
import { cache } from './common/cache';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Middleware ─────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'http://localhost:*'],
        },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Screen-Resolution', 'X-Timezone'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After', 'X-Idempotent-Replayed'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting (per-category) ────────────────
app.use(rateLimiter);

// ── Idempotency (POST endpoints) ────────────────
app.use('/api/funds/purchase', idempotencyGuard);
app.use('/api/funds/sip', idempotencyGuard);
app.use('/api/payments/initiate', idempotencyGuard);

// ── Security Headers ────────────────────────────
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0'); // Modern CSP replaces this
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// ── Request Logging (sanitized — no PII) ────────
app.use((req, _res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

// ── Health Check ────────────────────────────────
app.get('/api/health', (_req, res) => {
    const auditIntegrity = verifyAuditChain();

    res.json({
        status: 'ok',
        service: 'InvestWise API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        circuitBreakers: {
            bseStarMF: bseStarMFBreaker.getState(),
            razorpay: razorpayBreaker.getState(),
            digiLocker: digiLockerBreaker.getState(),
        },
        cache: cache.stats(),
        auditChain: auditIntegrity,
    });
});

// ── Route Mounting ──────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/funds', fundsRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/discover', discoverRouter);
app.use('/api/notifications', notificationsRouter);

// ── 404 Handler ─────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: { message: 'Endpoint not found' },
    });
});

// ── Global Error Handler ────────────────────────
app.use(errorHandler);

// ── Graceful Shutdown ───────────────────────────
process.on('SIGTERM', () => {
    console.log('[SHUTDOWN] SIGTERM received. Gracefully shutting down...');
    process.exit(0);
});

process.on('unhandledRejection', (reason) => {
    console.error('[UNHANDLED_REJECTION]', reason);
});

// ── Start ───────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 InvestWise API v1.0.0`);
    console.log(`   ├─ Server: http://localhost:${PORT}`);
    console.log(`   ├─ Health: http://localhost:${PORT}/api/health`);
    console.log(`   ├─ Security: Helmet, CORS, Rate Limiting, Idempotency`);
    console.log(`   ├─ Circuit Breakers: BSE StarMF, Razorpay, DigiLocker`);
    console.log(`   └─ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
