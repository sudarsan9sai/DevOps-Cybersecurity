// ═══════════════════════════════════════════════════════════════════════════════
// INVESTWISE — MONOREPO FOLDER STRUCTURE
// Clean Architecture with Domain-Driven Design
// ═══════════════════════════════════════════════════════════════════════════════
//
// investwise/
// │
// ├── docs/                              # Architecture & API documentation
// │   ├── ARCHITECTURE.ts                # System design diagram (ASCII)
// │   ├── FOLDER_STRUCTURE.ts            # This file
// │   └── openapi.yaml                   # OpenAPI 3.0 specification
// │
// ├── server/                            # ── BACKEND (Node.js + Express + TypeScript) ──
// │   ├── package.json
// │   ├── tsconfig.json
// │   ├── .env.example                   # Environment template
// │   ├── Dockerfile                     # Production container
// │   ├── jest.config.ts                 # Test configuration
// │   │
// │   └── src/
// │       ├── main.ts                    # Server entry point
// │       │
// │       ├── config/                    # ── Configuration ──
// │       │   ├── db.ts                  # PostgreSQL / Prisma client
// │       │   ├── redis.ts              # Redis connection
// │       │   └── bull.ts               # Bull queue config
// │       │
// │       ├── common/                    # ── Cross-cutting concerns ──
// │       │   ├── authGuard.ts          # JWT verification middleware
// │       │   ├── rateLimiter.ts        # Per-category rate limiting
// │       │   ├── errorHandler.ts       # Global error handler
// │       │   ├── encryption.ts         # AES-256-GCM for PII
// │       │   ├── auditLogger.ts        # Immutable audit trail
// │       │   ├── circuitBreaker.ts     # Circuit breaker pattern
// │       │   ├── idempotency.ts        # Idempotent POST middleware
// │       │   ├── cache.ts              # In-memory/Redis cache with TTL
// │       │   └── consent.ts            # DPDPA 2023 consent management
// │       │
// │       ├── modules/                   # ── Domain modules (DDD bounded contexts) ──
// │       │   │
// │       │   ├── auth/                  # Auth & KYC Module
// │       │   │   ├── auth.routes.ts    # POST /send-otp, /verify-otp, GET /profile
// │       │   │   ├── auth.service.ts   # OTP generation, JWT issuance
// │       │   │   ├── auth.data.ts      # Mock data store (→ Prisma in prod)
// │       │   │   └── kyc.routes.ts     # POST /verify-pan, /verify-aadhaar, /video-kyc
// │       │   │
// │       │   ├── funds/                 # Mutual Fund Module
// │       │   │   ├── funds.routes.ts   # GET /funds, /:id, POST /sip, /purchase
// │       │   │   ├── funds.service.ts  # Browse, filter, SIP CRUD, lumpsum
// │       │   │   └── funds.data.ts     # Seed data (12 funds, NAV history)
// │       │   │
// │       │   ├── portfolio/             # Portfolio Module
// │       │   │   ├── portfolio.routes.ts   # GET /holdings, /summary, /allocation
// │       │   │   └── portfolio.service.ts  # XIRR, P&L, allocation calc
// │       │   │
// │       │   ├── payments/              # Payments Module
// │       │   │   ├── payments.routes.ts    # POST /initiate, /verify, GET /history
// │       │   │   └── payments.service.ts   # Razorpay integration, bank accts
// │       │   │
// │       │   ├── watchlist/             # Watchlist & Discovery Module
// │       │   │   ├── watchlist.routes.ts   # CRUD watchlist, alerts, search, trending
// │       │   │   └── watchlist.service.ts  # Search, trending, alerts
// │       │   │
// │       │   └── notifications/         # Notifications Module
// │       │       ├── notifications.routes.ts  # GET /, PUT /read, /preferences
// │       │       └── notifications.service.ts # Multi-channel dispatch
// │       │
// │       ├── services/                  # ── Core Business Logic (STEP 5) ──
// │       │   ├── orderService.ts       # MF order placement, idempotency, BSE StarMF
// │       │   ├── portfolioService.ts   # XIRR (Newton-Raphson), P&L, allocation
// │       │   └── kycService.ts         # PAN/Aadhaar/Video KYC orchestrator
// │       │
// │       ├── jobs/                      # ── Background Jobs ──
// │       │   └── sipProcessor.ts       # Bull queue: daily SIP execution at 6 AM IST
// │       │
// │       ├── prisma/
// │       │   └── schema.prisma         # Database schema (15 models)
// │       │
// │       └── __tests__/                 # ── Test Suite ──
// │           ├── orderService.test.ts  # Jest unit tests
// │           ├── portfolioService.test.ts
// │           └── e2e/
// │               └── sipPurchase.spec.ts  # Playwright E2E
// │
// ├── client/                            # ── FRONTEND (React 18 + TypeScript + Vite) ──
// │   ├── package.json
// │   ├── tsconfig.json
// │   ├── vite.config.ts                # Vite + API proxy
// │   ├── tailwind.config.js            # Custom dark theme, glassmorphism
// │   ├── postcss.config.js
// │   ├── index.html                    # SEO meta, Inter font, dark bg
// │   │
// │   └── src/
// │       ├── main.tsx                  # React root
// │       ├── App.tsx                   # Router
// │       ├── index.css                 # Design system (glass-card, btn, badge)
// │       │
// │       ├── api/
// │       │   └── client.ts             # Fetch wrapper, JWT injection
// │       │
// │       ├── components/               # ── Shared Components ──
// │       │   └── Layout.tsx            # Sidebar + top bar + market status
// │       │
// │       ├── pages/                    # ── Route Pages ──
// │       │   ├── LoginPage.tsx         # OTP flow + demo login
// │       │   ├── DashboardPage.tsx     # Portfolio summary, charts, holdings
// │       │   ├── FundsPage.tsx         # Browse, filter, search funds
// │       │   ├── FundDetailPage.tsx    # NAV chart, SIP/Lumpsum invest modal
// │       │   ├── WatchlistPage.tsx     # Watchlist + discover tabs
// │       │   ├── NotificationsPage.tsx # Notification center
// │       │   └── ProfilePage.tsx       # Profile, KYC, bank, security, DPDPA
// │       │
// │       ├── store/                    # Zustand stores (future)
// │       ├── hooks/                    # Custom React hooks
// │       └── lib/                      # Zod schemas, utilities
// │
// ├── deploy/                            # ── DEPLOYMENT ──
// │   ├── docker-compose.yml            # Local dev (Postgres + Redis + app)
// │   ├── Dockerfile.server             # Backend container
// │   ├── Dockerfile.client             # Frontend container (nginx)
// │   └── nginx.conf                    # Reverse proxy config
// │
// ├── .github/
// │   └── workflows/
// │       └── deploy.yml                # CI/CD: lint → test → build → deploy
// │
// └── README.md

export {};
