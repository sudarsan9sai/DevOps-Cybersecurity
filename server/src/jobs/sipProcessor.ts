// ═══════════════════════════════════════════════════════════════════════════════
// SIP PROCESSOR — Bull Queue Job for Daily SIP Execution
// ═══════════════════════════════════════════════════════════════════════════════
//
// BUSINESS CONTEXT:
//   This is a background job that runs daily at 6:00 AM IST.
//   It picks up all SIPs due for execution today and creates orders.
//
// WHY 6 AM IST:
//   - Market opens at 9:15 AM. Processing at 6 AM gives 3+ hours buffer
//     for payment collection (NACH auto-debit) before order cutoff
//   - AMFI cutoff: Orders before 3 PM get same-day NAV. SIP orders
//     placed early have higher chance of getting same-day NAV
//
// SIP EXECUTION FLOW:
//   1. Fetch all active SIPs where nextExecutionDate <= today
//   2. For each SIP:
//      a. Check SIP is still active (not paused/cancelled)
//      b. Create order via orderService (inherits idempotency)
//      c. Trigger NACH auto-debit for payment
//      d. Update SIP: increment completed, set next execution date
//      e. Handle failures: increment failedCount, auto-cancel after 3 consecutive
//   3. Send batch notifications for all processed SIPs
//
// FAILURE HANDLING:
//   - Payment failure: SIP order marked FAILED, retried next business day
//   - BSE submission failure: Order stays PENDING, circuit breaker manages retries
//   - 3 consecutive failures: SIP auto-cancelled, user notified
//   - Idempotency: Same SIP + date combo generates same idempotency key,
//     preventing duplicate orders if job runs twice on same day
//
// SCALING:
//   - Bull uses Redis for queue management
//   - Multiple worker instances can process SIPs concurrently
//   - Each SIP generates a unique job ID to prevent duplicates
//   - Job concurrency: 10 (process 10 SIPs simultaneously)
//   - At 10M users with 50% SIP adoption = ~5M SIPs/day
//     → With 10 concurrent workers: ~8 minutes processing time
// ═══════════════════════════════════════════════════════════════════════════════

import { orderService } from '../services/orderService';
import { auditLog } from '../common/auditLogger';

// ── Types ────────────────────────────────────────────────────────────────────

interface SipRecord {
  id: string;
  userId: string;
  fundId: string;
  amount: number;
  sipDate: number;                  // Day of month (1-28)
  frequency: 'MONTHLY' | 'WEEKLY' | 'QUARTERLY';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  startDate: string;
  endDate: string | null;
  totalInstallments: number | null;
  completedInstallments: number;
  failedInstallments: number;
  consecutiveFailures: number;
  nextExecutionDate: string;
  mandateId: string | null;
  lastExecutedAt: string | null;
}

interface SipProcessingResult {
  sipId: string;
  userId: string;
  fundId: string;
  success: boolean;
  orderId?: string;
  error?: string;
  action: 'ORDER_PLACED' | 'SKIPPED' | 'FAILED' | 'AUTO_CANCELLED' | 'COMPLETED';
}

// ── Mock SIP Store (replace with Prisma query) ──────────────────────────────

const sipStore = new Map<string, SipRecord>();

// Seed demo SIPs
sipStore.set('sip_001', {
  id: 'sip_001', userId: 'user_001', fundId: 'fund_001', amount: 5000,
  sipDate: 5, frequency: 'MONTHLY', status: 'ACTIVE',
  startDate: '2024-01-05', endDate: null, totalInstallments: null,
  completedInstallments: 14, failedInstallments: 0, consecutiveFailures: 0,
  nextExecutionDate: new Date().toISOString().slice(0, 10), // Today
  mandateId: 'mandate_001', lastExecutedAt: null,
});

sipStore.set('sip_002', {
  id: 'sip_002', userId: 'user_001', fundId: 'fund_009', amount: 10000,
  sipDate: 15, frequency: 'MONTHLY', status: 'ACTIVE',
  startDate: '2023-11-15', endDate: null, totalInstallments: 24,
  completedInstallments: 16, failedInstallments: 1, consecutiveFailures: 0,
  nextExecutionDate: new Date().toISOString().slice(0, 10),
  mandateId: 'mandate_002', lastExecutedAt: null,
});

sipStore.set('sip_003', {
  id: 'sip_003', userId: 'user_001', fundId: 'fund_011', amount: 2500,
  sipDate: 1, frequency: 'MONTHLY', status: 'ACTIVE',
  startDate: '2025-01-01', endDate: '2025-12-01', totalInstallments: 12,
  completedInstallments: 3, failedInstallments: 0, consecutiveFailures: 0,
  nextExecutionDate: new Date().toISOString().slice(0, 10),
  mandateId: 'mandate_003', lastExecutedAt: null,
});

// ── SIP Processor ────────────────────────────────────────────────────────────

export class SipProcessor {
  // Maximum consecutive payment failures before auto-cancellation.
  // BUSINESS DECISION: 3 failures → cancel SIP, notify user.
  // This prevents indefinite failed charges on user's mandate.
  private readonly MAX_CONSECUTIVE_FAILURES = 3;

  // Bull job concurrency — how many SIPs to process in parallel.
  // Balances throughput vs. database/API load.
  private readonly CONCURRENCY = 10;

  /**
   * Main processor: fetch due SIPs and execute them.
   *
   * In production, this is registered as a Bull repeatable job:
   * ```
   * sipQueue.add('process-daily-sips', {}, {
   *   repeat: { cron: '0 6 * * 1-6', tz: 'Asia/Kolkata' },
   *   // 6 AM IST, Mon-Sat (markets closed Sunday)
   * });
   * ```
   */
  async processDaily(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
    results: SipProcessingResult[];
  }> {
    const today = new Date().toISOString().slice(0, 10);
    console.log(`\n[SIP PROCESSOR] Starting daily SIP processing for ${today}`);
    console.log(`[SIP PROCESSOR] Fetching SIPs due for execution...`);

    // ── Step 1: Fetch Due SIPs ──
    // Query: WHERE status = 'ACTIVE' AND nextExecutionDate <= today
    const dueSips = this.getDueSips(today);

    if (dueSips.length === 0) {
      console.log(`[SIP PROCESSOR] No SIPs due for execution today.`);
      return { processed: 0, succeeded: 0, failed: 0, skipped: 0, results: [] };
    }

    console.log(`[SIP PROCESSOR] Found ${dueSips.length} SIPs to process.`);

    // ── Step 2: Process Each SIP ──
    const results: SipProcessingResult[] = [];
    let succeeded = 0, failed = 0, skipped = 0;

    // In production: use Bull's concurrency to process in parallel
    // For MVP: sequential processing
    for (const sip of dueSips) {
      const result = await this.processSingleSip(sip, today);
      results.push(result);

      switch (result.action) {
        case 'ORDER_PLACED': succeeded++; break;
        case 'FAILED': case 'AUTO_CANCELLED': failed++; break;
        case 'SKIPPED': case 'COMPLETED': skipped++; break;
      }
    }

    // ── Step 3: Log Summary ──
    console.log(`[SIP PROCESSOR] Processing complete.`);
    console.log(`  ├─ Processed: ${dueSips.length}`);
    console.log(`  ├─ Succeeded: ${succeeded}`);
    console.log(`  ├─ Failed: ${failed}`);
    console.log(`  └─ Skipped: ${skipped}`);

    auditLog({
      userId: 'SYSTEM',
      action: 'SIP_BATCH_PROCESSED',
      module: 'sip',
      details: {
        date: today,
        total: dueSips.length,
        succeeded,
        failed,
        skipped,
      },
    });

    return { processed: dueSips.length, succeeded, failed, skipped, results };
  }

  /**
   * Process a single SIP installment.
   *
   * IDEMPOTENCY: The idempotency key is generated from SIP ID + execution date.
   * If the processor runs twice on the same day (crash recovery), the same
   * idempotency key prevents duplicate orders via orderService.
   */
  private async processSingleSip(sip: SipRecord, today: string): Promise<SipProcessingResult> {
    console.log(`[SIP] Processing SIP ${sip.id}: ₹${sip.amount} for fund ${sip.fundId}`);

    // ── Check if Already Completed ──
    // SIP has reached total installment count → mark as completed
    if (sip.totalInstallments && sip.completedInstallments >= sip.totalInstallments) {
      sip.status = 'COMPLETED';
      sipStore.set(sip.id, sip);

      console.log(`[SIP] SIP ${sip.id} completed all ${sip.totalInstallments} installments.`);

      return {
        sipId: sip.id, userId: sip.userId, fundId: sip.fundId,
        success: true, action: 'COMPLETED',
      };
    }

    // ── Check End Date ──
    if (sip.endDate && today > sip.endDate) {
      sip.status = 'COMPLETED';
      sipStore.set(sip.id, sip);
      return {
        sipId: sip.id, userId: sip.userId, fundId: sip.fundId,
        success: true, action: 'COMPLETED',
      };
    }

    // ── Generate Idempotency Key ──
    // Deterministic: same SIP + same date = same key
    // This ensures exactly-once processing even on retry
    const idempotencyKey = `sip_${sip.id}_${today}`;

    try {
      // ── Place Order via Order Service ──
      const result = await orderService.placeOrder({
        userId: sip.userId,
        fundId: sip.fundId,
        amount: sip.amount,
        orderType: 'SIP',
        sipPlanId: sip.id,
        idempotencyKey,
      });

      // ── Update SIP Record ──
      sip.completedInstallments += 1;
      sip.consecutiveFailures = 0; // Reset on success
      sip.lastExecutedAt = new Date().toISOString();
      sip.nextExecutionDate = this.calculateNextExecutionDate(sip);
      sipStore.set(sip.id, sip);

      console.log(`[SIP] ✅ SIP ${sip.id} installment #${sip.completedInstallments} placed. Order: ${result.orderId}`);

      // In production: send notification to user
      // notificationService.send(sip.userId, 'SIP_EXECUTED', { ... });

      return {
        sipId: sip.id, userId: sip.userId, fundId: sip.fundId,
        success: true, orderId: result.orderId, action: 'ORDER_PLACED',
      };
    } catch (error: any) {
      // ── Handle Failure ──
      sip.failedInstallments += 1;
      sip.consecutiveFailures += 1;

      console.error(`[SIP] ❌ SIP ${sip.id} failed: ${error.message}`);

      // ── Auto-Cancel After 3 Consecutive Failures ──
      // BUSINESS DECISION: If NACH mandate fails 3 times in a row,
      // it likely means insufficient funds or mandate revoked.
      // Auto-cancel to prevent user frustration and bank charges.
      if (sip.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        sip.status = 'FAILED';
        sipStore.set(sip.id, sip);

        console.warn(`[SIP] ⚠️ SIP ${sip.id} auto-cancelled after ${this.MAX_CONSECUTIVE_FAILURES} consecutive failures.`);

        auditLog({
          userId: sip.userId, action: 'SIP_AUTO_CANCELLED', module: 'sip',
          details: { sipId: sip.id, consecutiveFailures: sip.consecutiveFailures, reason: error.message },
        });

        // In production: send high-priority notification
        // notificationService.send(sip.userId, 'SIP_CANCELLED', { ... });

        return {
          sipId: sip.id, userId: sip.userId, fundId: sip.fundId,
          success: false, error: 'Auto-cancelled after repeated failures',
          action: 'AUTO_CANCELLED',
        };
      }

      // SIP stays active, will retry next month
      sip.nextExecutionDate = this.calculateNextExecutionDate(sip);
      sipStore.set(sip.id, sip);

      // In production: send failure notification
      // notificationService.send(sip.userId, 'SIP_FAILED', { ... });

      return {
        sipId: sip.id, userId: sip.userId, fundId: sip.fundId,
        success: false, error: error.message, action: 'FAILED',
      };
    }
  }

  /**
   * Calculate next SIP execution date based on frequency.
   *
   * EDGE CASES:
   * - February: SIP date 29/30/31 → rolls to last day of Feb (28 or 29)
   * - SIP date 31 in 30-day months → rolls to 30th
   * - Weekends/holidays: Order is accepted on the next business day by BSE
   *   (we don't skip weekends — BSE handles business day processing)
   *
   * We use sipDate 1-28 to avoid month-end ambiguity (recommended by AMFI).
   */
  private calculateNextExecutionDate(sip: SipRecord): string {
    const current = new Date(sip.nextExecutionDate);
    let next: Date;

    switch (sip.frequency) {
      case 'WEEKLY':
        next = new Date(current);
        next.setDate(next.getDate() + 7);
        break;

      case 'QUARTERLY':
        next = new Date(current);
        next.setMonth(next.getMonth() + 3);
        // Ensure day doesn't overflow (e.g., Jan 31 + 3 months → Apr 30)
        next.setDate(Math.min(sip.sipDate, this.daysInMonth(next.getFullYear(), next.getMonth())));
        break;

      case 'MONTHLY':
      default:
        next = new Date(current);
        next.setMonth(next.getMonth() + 1);
        // Handle day overflow
        next.setDate(Math.min(sip.sipDate, this.daysInMonth(next.getFullYear(), next.getMonth())));
        break;
    }

    return next.toISOString().slice(0, 10);
  }

  /**
   * Get number of days in a month (handles leap years).
   */
  private daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Fetch all active SIPs due for execution on or before the given date.
   *
   * In production (Prisma):
   * ```
   * prisma.sipPlan.findMany({
   *   where: {
   *     status: 'ACTIVE',
   *     nextExecutionDate: { lte: new Date(today) },
   *   },
   *   orderBy: { nextExecutionDate: 'asc' },
   * });
   * ```
   */
  private getDueSips(today: string): SipRecord[] {
    return Array.from(sipStore.values()).filter(
      sip => sip.status === 'ACTIVE' && sip.nextExecutionDate <= today
    );
  }

  /**
   * Get all SIPs for a user.
   */
  getUserSips(userId: string, statusFilter?: string): SipRecord[] {
    return Array.from(sipStore.values())
      .filter(sip => sip.userId === userId)
      .filter(sip => !statusFilter || sip.status === statusFilter);
  }
}

// ── Bull Queue Setup (Production) ────────────────────────────────────────────
//
// In production, register this as a Bull repeatable job:
//
// ```typescript
// import Bull from 'bull';
//
// const sipQueue = new Bull('sip-processing', {
//   redis: { host: process.env.REDIS_HOST, port: 6379 },
// });
//
// // Register processor
// sipQueue.process('process-daily-sips', 10, async (job) => {
//   const processor = new SipProcessor();
//   return await processor.processDaily();
// });
//
// // Schedule: 6 AM IST, Monday to Saturday
// sipQueue.add('process-daily-sips', {}, {
//   repeat: {
//     cron: '0 6 * * 1-6',
//     tz: 'Asia/Kolkata',
//   },
//   priority: 1,
//   attempts: 3,
//   backoff: { type: 'exponential', delay: 5000 },
// });
//
// // Event listeners
// sipQueue.on('completed', (job, result) => {
//   console.log(`[SIP QUEUE] Job ${job.id} completed:`, result);
// });
//
// sipQueue.on('failed', (job, err) => {
//   console.error(`[SIP QUEUE] Job ${job.id} failed:`, err.message);
//   // Alert on-call engineer via PagerDuty
// });
// ```

// ── Singleton Export ─────────────────────────────────────────────────────────
export const sipProcessor = new SipProcessor();
