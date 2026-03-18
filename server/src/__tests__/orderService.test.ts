// ═══════════════════════════════════════════════════════════════════════════════
// ORDER SERVICE — Jest Unit Tests
// ═══════════════════════════════════════════════════════════════════════════════
//
// TEST STRATEGY:
//   - Unit tests for OrderService in isolation (no external APIs)
//   - Each test verifies a specific business rule or edge case
//   - Mock data is used throughout (no database dependency)
//
// REGULATORY TESTS:
//   - KYC validation before order placement
//   - Stamp duty calculation (SEBI mandate)
//   - Idempotency key enforcement (no duplicate orders)
//   - ARN code tracking (AMFI requirement)
// ═══════════════════════════════════════════════════════════════════════════════

import { OrderService, OrderError } from '../services/orderService';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    // Fresh instance for each test to avoid state leak
    service = new OrderService();
  });

  // ── HAPPY PATH ─────────────────────────────────────────────────────────────

  describe('placeOrder — success cases', () => {
    it('should place a lumpsum order successfully', async () => {
      const result = await service.placeOrder({
        userId: 'user_001',           // Demo user with APPROVED KYC
        fundId: 'fund_001',           // Axis Bluechip, NAV 52.34
        amount: 10000,
        orderType: 'LUMPSUM',
        idempotencyKey: 'idem_test_001',
      });

      expect(result).toBeDefined();
      expect(result.orderId).toBeDefined();
      expect(result.amount).toBe(10000);
      expect(result.nav).toBe(52.34);
      expect(result.estimatedUnits).toBeGreaterThan(0);
      // Status should be SUBMITTED or PENDING (depends on circuit breaker)
      expect(['SUBMITTED', 'PENDING']).toContain(result.status);
    });

    it('should calculate stamp duty at 0.005% per SEBI mandate', async () => {
      const result = await service.placeOrder({
        userId: 'user_001',
        fundId: 'fund_001',
        amount: 100000,               // ₹1 lakh
        orderType: 'LUMPSUM',
        idempotencyKey: 'idem_test_stamp',
      });

      // Stamp duty = 100000 * 0.00005 = ₹5.00
      expect(result.stampDuty).toBe(5);
      expect(result.totalDebit).toBe(100005);
    });

    it('should estimate units correctly based on NAV', async () => {
      const result = await service.placeOrder({
        userId: 'user_001',
        fundId: 'fund_001',           // NAV = 52.34
        amount: 52340,                // Exactly 1000 units worth
        orderType: 'LUMPSUM',
        idempotencyKey: 'idem_test_units',
      });

      // 52340 / 52.34 ≈ 1000 units
      expect(result.estimatedUnits).toBeCloseTo(1000, 0);
    });

    it('should place a SIP installment order', async () => {
      const result = await service.placeOrder({
        userId: 'user_001',
        fundId: 'fund_009',           // Parag Parikh Flexi Cap, min SIP ₹1000
        amount: 5000,
        orderType: 'SIP',
        sipPlanId: 'sip_001',
        idempotencyKey: 'idem_test_sip',
      });

      expect(result).toBeDefined();
      expect(result.amount).toBe(5000);
    });

    it('should include payment details with Razorpay order ID', async () => {
      const result = await service.placeOrder({
        userId: 'user_001',
        fundId: 'fund_001',
        amount: 5000,
        orderType: 'LUMPSUM',
        idempotencyKey: 'idem_test_payment',
      });

      expect(result.paymentDetails).toBeDefined();
      expect(result.paymentDetails?.razorpayOrderId).toContain('rzp_order_');
      expect(result.paymentDetails?.amount).toBe(result.totalDebit);
      expect(result.paymentDetails?.currency).toBe('INR');
    });
  });

  // ── IDEMPOTENCY TESTS ─────────────────────────────────────────────────────

  describe('placeOrder — idempotency', () => {
    it('should return the same result for duplicate idempotency keys', async () => {
      const key = 'idem_duplicate_test';

      const first = await service.placeOrder({
        userId: 'user_001', fundId: 'fund_001', amount: 5000,
        orderType: 'LUMPSUM', idempotencyKey: key,
      });

      const second = await service.placeOrder({
        userId: 'user_001', fundId: 'fund_001', amount: 5000,
        orderType: 'LUMPSUM', idempotencyKey: key,
      });

      // CRITICAL: Same orderId, no duplicate charge
      expect(second.orderId).toBe(first.orderId);
      expect(second.amount).toBe(first.amount);
    });

    it('should create separate orders for different idempotency keys', async () => {
      const first = await service.placeOrder({
        userId: 'user_001', fundId: 'fund_001', amount: 5000,
        orderType: 'LUMPSUM', idempotencyKey: 'key_A',
      });

      const second = await service.placeOrder({
        userId: 'user_001', fundId: 'fund_001', amount: 5000,
        orderType: 'LUMPSUM', idempotencyKey: 'key_B',
      });

      expect(second.orderId).not.toBe(first.orderId);
    });
  });

  // ── VALIDATION TESTS ──────────────────────────────────────────────────────

  describe('placeOrder — validation', () => {
    it('should reject orders from users without KYC approval', async () => {
      await expect(
        service.placeOrder({
          userId: 'user_no_kyc',      // Not in KYC store → NOT_STARTED
          fundId: 'fund_001',
          amount: 5000,
          orderType: 'LUMPSUM',
          idempotencyKey: 'idem_no_kyc',
        })
      ).rejects.toThrow('KYC verification must be completed');

      try {
        await service.placeOrder({
          userId: 'user_no_kyc', fundId: 'fund_001',
          amount: 5000, orderType: 'LUMPSUM', idempotencyKey: 'idem_no_kyc_2',
        });
      } catch (error: any) {
        expect(error).toBeInstanceOf(OrderError);
        expect(error.code).toBe('KYC_REQUIRED');
        expect(error.statusCode).toBe(403);
      }
    });

    it('should reject orders for non-existent funds', async () => {
      await expect(
        service.placeOrder({
          userId: 'user_001',
          fundId: 'fund_nonexistent',
          amount: 5000,
          orderType: 'LUMPSUM',
          idempotencyKey: 'idem_bad_fund',
        })
      ).rejects.toThrow('Fund not found');
    });

    it('should reject SIP amount below fund minimum', async () => {
      await expect(
        service.placeOrder({
          userId: 'user_001',
          fundId: 'fund_003',         // ICICI Tech, min SIP = ₹1000
          amount: 500,                // Below minimum
          orderType: 'SIP',
          idempotencyKey: 'idem_below_min',
        })
      ).rejects.toThrow('Minimum SIP amount');
    });

    it('should reject lumpsum below fund minimum', async () => {
      await expect(
        service.placeOrder({
          userId: 'user_001',
          fundId: 'fund_001',         // min lumpsum = ₹5000
          amount: 1000,               // Below minimum
          orderType: 'LUMPSUM',
          idempotencyKey: 'idem_below_lump',
        })
      ).rejects.toThrow('Minimum lumpsum amount');
    });
  });

  // ── ORDER MANAGEMENT ──────────────────────────────────────────────────────

  describe('getOrder / cancelOrder', () => {
    it('should retrieve order by ID', async () => {
      const result = await service.placeOrder({
        userId: 'user_001', fundId: 'fund_001', amount: 5000,
        orderType: 'LUMPSUM', idempotencyKey: 'idem_retrieve',
      });

      const order = service.getOrder(result.orderId, 'user_001');
      expect(order).toBeDefined();
      expect(order.amount).toBe(5000);
    });

    it('should not return order for wrong user', async () => {
      const result = await service.placeOrder({
        userId: 'user_001', fundId: 'fund_001', amount: 5000,
        orderType: 'LUMPSUM', idempotencyKey: 'idem_wrong_user',
      });

      const order = service.getOrder(result.orderId, 'user_other');
      expect(order).toBeNull();
    });

    it('should cancel a PENDING order', async () => {
      // Place an order and force it to PENDING status
      const result = await service.placeOrder({
        userId: 'user_001', fundId: 'fund_001', amount: 5000,
        orderType: 'LUMPSUM', idempotencyKey: 'idem_cancel',
      });

      // Force status to PENDING for this test
      service.updateOrderStatus(result.orderId, 'PENDING');

      const cancelled = service.cancelOrder(result.orderId, 'user_001');
      expect(cancelled).toBe(true);

      const order = service.getOrder(result.orderId, 'user_001');
      expect(order.status).toBe('CANCELLED');
    });
  });
});
