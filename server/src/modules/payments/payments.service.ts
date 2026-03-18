import { v4 as uuid } from 'uuid';

// ── Payment Mock Data ───────────────────────────

export interface PaymentTransaction {
    id: string;
    userId: string;
    orderId?: string;
    amount: number;
    method: string;
    status: string;
    gatewayId?: string;
    createdAt: string;
}

export interface BankAccount {
    id: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
    isPrimary: boolean;
    verified: boolean;
}

export const payments: PaymentTransaction[] = [
    { id: 'pay_001', userId: 'usr_demo_001', orderId: 'ord_001', amount: 50000, method: 'UPI', status: 'SUCCESS', gatewayId: 'rzp_pay_001', createdAt: '2025-01-15T10:05:00Z' },
    { id: 'pay_002', userId: 'usr_demo_001', orderId: 'ord_002', amount: 25000, method: 'NET_BANKING', status: 'SUCCESS', gatewayId: 'rzp_pay_002', createdAt: '2025-02-15T10:05:00Z' },
    { id: 'pay_003', userId: 'usr_demo_001', orderId: 'ord_004', amount: 100000, method: 'UPI', status: 'SUCCESS', gatewayId: 'rzp_pay_003', createdAt: '2025-01-01T10:05:00Z' },
];

export const bankAccounts: BankAccount[] = [
    { id: 'bank_001', userId: 'usr_demo_001', bankName: 'HDFC Bank', accountNumber: 'XXXX1234', ifscCode: 'HDFC0001234', accountHolder: 'Arjun Sharma', isPrimary: true, verified: true },
    { id: 'bank_002', userId: 'usr_demo_001', bankName: 'ICICI Bank', accountNumber: 'XXXX5678', ifscCode: 'ICIC0005678', accountHolder: 'Arjun Sharma', isPrimary: false, verified: true },
];

// ── Payment Service ─────────────────────────────

export async function initiatePayment(userId: string, data: { amount: number; method: string; orderId?: string }) {
    const payment: PaymentTransaction = {
        id: `pay_${uuid().slice(0, 8)}`,
        userId,
        orderId: data.orderId,
        amount: data.amount,
        method: data.method,
        status: 'INITIATED',
        gatewayId: `rzp_pay_${uuid().slice(0, 8)}`,
        createdAt: new Date().toISOString(),
    };

    payments.push(payment);

    // Mock Razorpay order creation
    return {
        payment,
        razorpayOrder: {
            id: `order_${uuid().slice(0, 12)}`,
            amount: data.amount * 100, // paise
            currency: 'INR',
            receipt: payment.id,
        },
    };
}

export async function verifyPayment(userId: string, data: { paymentId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    const payment = payments.find((p) => p.id === data.paymentId && p.userId === userId);
    if (!payment) throw { statusCode: 404, message: 'Payment not found' };

    // Mock Razorpay signature verification (always pass in dev)
    payment.status = 'SUCCESS';
    payment.gatewayId = data.razorpayPaymentId;

    return { payment, verified: true, message: 'Payment verified successfully' };
}

export async function getPaymentHistory(userId: string, page = 1, limit = 20) {
    const userPayments = payments
        .filter((p) => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = userPayments.length;
    const paginated = userPayments.slice((page - 1) * limit, page * limit);

    return { payments: paginated, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function linkBankAccount(userId: string, data: { bankName: string; accountNumber: string; ifscCode: string; accountHolder: string }) {
    const account: BankAccount = {
        id: `bank_${uuid().slice(0, 8)}`,
        userId,
        ...data,
        isPrimary: bankAccounts.filter((b) => b.userId === userId).length === 0,
        verified: true, // Auto-verify in mock
    };

    bankAccounts.push(account);
    return account;
}

export async function getBankAccounts(userId: string) {
    return bankAccounts.filter((b) => b.userId === userId);
}
