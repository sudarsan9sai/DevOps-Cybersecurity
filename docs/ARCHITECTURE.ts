// ═══════════════════════════════════════════════════════════════════════════════
// INVESTWISE — SYSTEM ARCHITECTURE DIAGRAM
// Retail Investment Platform (SEBI Regulated)
// Target: 1M users launch → 10M within 18 months
// ═══════════════════════════════════════════════════════════════════════════════
//
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │                              CLIENT TIER                                   │
// │                                                                             │
// │  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐          │
// │  │   React PWA     │   │  React Native    │   │  Admin Dashboard │          │
// │  │  (Vite + TW)    │   │  (Future)        │   │  (Internal)      │          │
// │  │                 │   │                  │   │                  │          │
// │  │ • Dashboard     │   │ • iOS/Android    │   │ • User Mgmt      │          │
// │  │ • Fund Browse   │   │ • Push Notifs    │   │ • Order Monitor   │          │
// │  │ • KYC Flow      │   │ • Biometric Auth │   │ • Compliance      │          │
// │  │ • Portfolio     │   │                  │   │ • Reports          │          │
// │  └───────┬─────────┘   └────────┬─────────┘   └─────────┬────────┘          │
// │          │                      │                        │                  │
// └──────────┼──────────────────────┼────────────────────────┼──────────────────┘
//            │ HTTPS/TLS 1.3        │                        │
//            ▼                      ▼                        ▼
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │                         EDGE / CDN TIER                                     │
// │                                                                             │
// │  ┌──────────────────────────────────────────────────────────────────┐       │
// │  │                    Azure CDN / CloudFront                        │       │
// │  │            Static Assets, Image Optimization, WAF                │       │
// │  └──────────────────────────┬───────────────────────────────────────┘       │
// │                             │                                               │
// │  ┌──────────────────────────▼───────────────────────────────────────┐       │
// │  │                 Azure API Management / Kong Gateway               │       │
// │  │     • Rate Limiting (5/min auth, 100/min general)                │       │
// │  │     • JWT Validation     • Request Logging                       │       │
// │  │     • API Versioning     • DDoS Protection                       │       │
// │  └──────────────────────────┬───────────────────────────────────────┘       │
// └─────────────────────────────┼───────────────────────────────────────────────┘
//                               │
//                               ▼
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │                       APPLICATION TIER (Azure Container Apps)               │
// │                                                                             │
// │  ┌─────────────┐ ┌──────────────┐ ┌────────────────┐ ┌──────────────┐      │
// │  │ AUTH SERVICE │ │ FUND SERVICE │ │ ORDER SERVICE  │ │ PORTFOLIO    │      │
// │  │             │ │              │ │                │ │ SERVICE      │      │
// │  │ • OTP Login │ │ • Browse/    │ │ • Place Order  │ │ • Holdings   │      │
// │  │ • JWT Issue │ │   Search     │ │ • Idempotency  │ │ • XIRR Calc  │      │
// │  │ • Refresh   │ │ • NAV Feed   │ │ • Circuit      │ │ • P&L        │      │
// │  │   Tokens    │ │ • Fund Detail│ │   Breaker      │ │ • Asset      │      │
// │  │ • Device    │ │ • Categories │ │ • BSE StarMF   │ │   Allocation │      │
// │  │   Fingerpr. │ │              │ │   Integration  │ │              │      │
// │  └──────┬──────┘ └──────┬───────┘ └───────┬────────┘ └──────┬───────┘      │
// │         │               │                 │                 │               │
// │  ┌──────┴──────┐ ┌──────┴───────┐ ┌───────┴────────┐ ┌─────┴────────┐      │
// │  │ KYC SERVICE │ │ SIP SERVICE  │ │PAYMENT SERVICE │ │ NOTIFICATION │      │
// │  │             │ │              │ │                │ │ SERVICE      │      │
// │  │ • PAN Verify│ │ • SIP Create │ │ • Razorpay     │ │ • FCM Push   │      │
// │  │ • Aadhaar   │ │ • SIP Modify │ │   Integration  │ │ • Twilio SMS │      │
// │  │   DigiLockr │ │ • Bull Queue │ │ • UPI Collect  │ │ • SendGrid   │      │
// │  │ • Video KYC │ │   Daily SIP  │ │ • Net Banking  │ │   Email      │      │
// │  │ • Re-KYC    │ │   Execution  │ │ • Mandate Mgmt │ │ • In-App     │      │
// │  │   (2 year)  │ │ • NACH Debit │ │ • Refund       │ │ • Templates  │      │
// │  └─────────────┘ └──────────────┘ └────────────────┘ └──────────────┘      │
// │                                                                             │
// │         ┌───────────────────────────────────────────┐                        │
// │         │          SHARED INFRASTRUCTURE            │                        │
// │         │  • Audit Logger (SEBI 7-Year Retention)  │                        │
// │         │  • AES-256 Encryption (PII at Rest)      │                        │
// │         │  • Consent Manager (DPDPA 2023)          │                        │
// │         │  • AMFI ARN Code Tracker                 │                        │
// │         └───────────────────────────────────────────┘                        │
// └────────┬────────────┬────────────┬────────────┬─────────────────────────────┘
//          │            │            │            │
//          ▼            ▼            ▼            ▼
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │                          DATA TIER                                          │
// │                                                                             │
// │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
// │  │  PostgreSQL   │  │    Redis      │  │  Azure Blob  │  │ Elasticsearch│    │
// │  │  (Azure DB)   │  │ (ElastiCache) │  │    Storage   │  │  (Logs/APM)  │    │
// │  │              │  │              │  │              │  │              │    │
// │  │ • Users      │  │ • Sessions   │  │ • KYC Docs   │  │ • Audit Logs │    │
// │  │ • Orders     │  │ • Cache (15m)│  │ • Video KYC  │  │ • API Logs   │    │
// │  │ • Holdings   │  │ • Rate Limits│  │ • Reports    │  │ • Analytics  │    │
// │  │ • Payments   │  │ • Bull Queues│  │ • Statements │  │              │    │
// │  │ • SIP Plans  │  │ • OTP Store  │  │              │  │              │    │
// │  │ • Audit Trail│  │              │  │              │  │              │    │
// │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
// └─────────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │                     EXTERNAL INTEGRATIONS                                   │
// │                                                                             │
// │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
// │  │  BSE StarMF  │  │   Razorpay   │  │  DigiLocker  │  │  CAMS /      │    │
// │  │  (MF Orders) │  │  (Payments)  │  │  (KYC Docs)  │  │  KFintech    │    │
// │  │              │  │              │  │              │  │  (NAV Feed)  │    │
// │  │ • Order      │  │ • UPI Collect│  │ • Aadhaar XML│  │ • Daily NAV  │    │
// │  │   Placement  │  │ • Net Banking│  │ • PAN Verify │  │ • AUM Data   │    │
// │  │ • Order      │  │ • Mandate    │  │ • Address    │  │ • Scheme     │    │
// │  │   Status     │  │   Registration│  │   Proof     │  │   Master     │    │
// │  │ • Redemption │  │ • Refunds    │  │              │  │              │    │
// │  │              │  │              │  │              │  │              │    │
// │  │ Circuit      │  │ Circuit      │  │ Circuit      │  │              │    │
// │  │ Breaker: ✓   │  │ Breaker: ✓   │  │ Breaker: ✓   │  │              │    │
// │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
// │                                                                             │
// │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
// │  │   Firebase   │  │   Twilio     │  │  SendGrid    │                      │
// │  │  (FCM Push)  │  │  (SMS/OTP)   │  │  (Email)     │                      │
// │  └──────────────┘  └──────────────┘  └──────────────┘                      │
// │                                                                             │
// │  ┌──────────────┐  ┌──────────────┐                                        │
// │  │   Sentry     │  │   Datadog    │                                        │
// │  │  (Errors)    │  │  (APM/Infra) │                                        │
// │  └──────────────┘  └──────────────┘                                        │
// └─────────────────────────────────────────────────────────────────────────────┘
//
// ═══════════════════════════════════════════════════════════════════════════════
// DATA FLOW: SIP ORDER EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════
//
//  ┌──────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
//  │ Bull │───▶│ SIP       │───▶│ Payment   │───▶│ BSE      │───▶│ Order    │
//  │ Cron │    │ Processor │    │ Service   │    │ StarMF   │    │ Allotted │
//  │ 6 AM │    │           │    │ (Mandate) │    │(Circuit  │    │          │
//  │ IST  │    │ Fetch Due │    │           │    │ Breaker) │    │ Update   │
//  └──────┘    │ SIPs      │    │ Auto-Debit│    │          │    │ Holdings │
//              └───────────┘    └───────────┘    └──────────┘    └──────────┘
//                   │                                                  │
//                   ▼                                                  ▼
//              ┌───────────┐                                    ┌──────────┐
//              │ Retry     │                                    │ Notif    │
//              │ Queue     │                                    │ Service  │
//              │ (Failed)  │                                    │ Push+SMS │
//              └───────────┘                                    └──────────┘
//
// ═══════════════════════════════════════════════════════════════════════════════
// DATA FLOW: KYC VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════
//
//  ┌──────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
//  │ User │───▶│ PAN       │───▶│ Aadhaar   │───▶│ Video    │───▶│ KYC      │
//  │      │    │ Submit    │    │ DigiLocker│    │ KYC      │    │ APPROVED │
//  │      │    │ (Regex +  │    │ (XML      │    │ (Manual/ │    │          │
//  │      │    │  NSDL API)│    │  Fetch)   │    │  AI Rev) │    │ Unlock   │
//  └──────┘    └───────────┘    └───────────┘    └──────────┘    │ Trading  │
//                   │                │                │          └──────────┘
//                   ▼                ▼                ▼
//              ┌──────────────────────────────────────────┐
//              │         AUDIT LOG (Immutable)            │
//              │  Every step logged with chained hashes   │
//              │  PII encrypted (AES-256-GCM) at rest     │
//              │  Retained for 7 years (SEBI mandate)     │
//              └──────────────────────────────────────────┘
//
// ═══════════════════════════════════════════════════════════════════════════════
// SCALING STRATEGY (1M → 10M users)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Phase 1 (0-1M):   Single region, 2 app replicas, RDS t3.xlarge
// Phase 2 (1-5M):   Multi-AZ, 4 replicas, RDS r6g.xlarge, read replicas
// Phase 3 (5-10M):  Multi-region (Mumbai + Chennai), 8 replicas, 
//                   DB sharding by user_id, dedicated Redis cluster,
//                   Event-driven architecture (Kafka for order events)
//
// ═══════════════════════════════════════════════════════════════════════════════

export {};
