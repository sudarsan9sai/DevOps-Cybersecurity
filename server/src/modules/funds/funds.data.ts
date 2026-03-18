// ── Mutual Fund Mock Data ───────────────────────
// Rich seed data for browsing, filtering, and investment flows

import { v4 as uuid } from 'uuid';

export interface MutualFund {
    id: string;
    schemeCode: string;
    schemeName: string;
    fundHouse: string;
    category: string;
    riskLevel: string;
    nav: number;
    aum: number;
    expenseRatio: number;
    return1y: number;
    return3y: number;
    return5y: number;
    minSipAmount: number;
    minLumpsum: number;
    exitLoad: string;
    isActive: boolean;
}

export interface SipPlan {
    id: string;
    userId: string;
    fundId: string;
    amount: number;
    frequency: string;
    sipDate: number;
    startDate: string;
    endDate?: string;
    status: string;
    totalInvested: number;
    nextSipDate: string;
    createdAt: string;
}

export interface MfOrder {
    id: string;
    userId: string;
    fundId: string;
    orderType: string;
    amount: number;
    nav: number;
    units: number;
    status: string;
    bseOrderId?: string;
    paymentId?: string;
    createdAt: string;
}

export interface NavHistory {
    date: string;
    nav: number;
}

// ── Seed Funds ──────────────────────────────────

export const funds: MutualFund[] = [
    {
        id: 'fund_001', schemeCode: 'INF846K01EW2', schemeName: 'Axis Bluechip Fund Direct Growth',
        fundHouse: 'Axis Mutual Fund', category: 'EQUITY', riskLevel: 'HIGH',
        nav: 52.34, aum: 34521, expenseRatio: 0.49, return1y: 18.5, return3y: 15.2, return5y: 14.8,
        minSipAmount: 500, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year', isActive: true,
    },
    {
        id: 'fund_002', schemeCode: 'INF090I01HD1', schemeName: 'HDFC Mid-Cap Opportunities Direct Growth',
        fundHouse: 'HDFC Mutual Fund', category: 'EQUITY', riskLevel: 'VERY_HIGH',
        nav: 78.92, aum: 42156, expenseRatio: 0.74, return1y: 32.1, return3y: 22.8, return5y: 19.5,
        minSipAmount: 500, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year', isActive: true,
    },
    {
        id: 'fund_003', schemeCode: 'INF109K01Z48', schemeName: 'ICICI Prudential Technology Direct Growth',
        fundHouse: 'ICICI Prudential', category: 'SECTORAL', riskLevel: 'VERY_HIGH',
        nav: 145.67, aum: 12340, expenseRatio: 0.99, return1y: 42.3, return3y: 28.1, return5y: 24.6,
        minSipAmount: 1000, minLumpsum: 5000, exitLoad: '1% if redeemed within 15 days', isActive: true,
    },
    {
        id: 'fund_004', schemeCode: 'INF200K01RY5', schemeName: 'SBI Small Cap Fund Direct Growth',
        fundHouse: 'SBI Mutual Fund', category: 'EQUITY', riskLevel: 'VERY_HIGH',
        nav: 134.21, aum: 26780, expenseRatio: 0.62, return1y: 28.7, return3y: 20.4, return5y: 22.1,
        minSipAmount: 500, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year', isActive: true,
    },
    {
        id: 'fund_005', schemeCode: 'INF173K01FQ4', schemeName: 'Kotak Equity Opportunities Direct Growth',
        fundHouse: 'Kotak Mutual Fund', category: 'EQUITY', riskLevel: 'HIGH',
        nav: 267.89, aum: 18920, expenseRatio: 0.52, return1y: 22.1, return3y: 17.6, return5y: 16.3,
        minSipAmount: 1000, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year', isActive: true,
    },
    {
        id: 'fund_006', schemeCode: 'INF846K01EW9', schemeName: 'Axis Liquid Fund Direct Growth',
        fundHouse: 'Axis Mutual Fund', category: 'LIQUID', riskLevel: 'LOW',
        nav: 2456.78, aum: 45600, expenseRatio: 0.15, return1y: 6.8, return3y: 5.9, return5y: 5.5,
        minSipAmount: 500, minLumpsum: 500, exitLoad: 'Nil after 7 days', isActive: true,
    },
    {
        id: 'fund_007', schemeCode: 'INF090I01953', schemeName: 'HDFC Corporate Bond Direct Growth',
        fundHouse: 'HDFC Mutual Fund', category: 'DEBT', riskLevel: 'MODERATE',
        nav: 28.45, aum: 28900, expenseRatio: 0.30, return1y: 8.2, return3y: 7.4, return5y: 7.8,
        minSipAmount: 500, minLumpsum: 5000, exitLoad: 'Nil', isActive: true,
    },
    {
        id: 'fund_008', schemeCode: 'INF179K01BH0', schemeName: 'Mirae Asset Large Cap Direct Growth',
        fundHouse: 'Mirae Asset', category: 'EQUITY', riskLevel: 'HIGH',
        nav: 89.34, aum: 38400, expenseRatio: 0.53, return1y: 16.9, return3y: 14.8, return5y: 15.2,
        minSipAmount: 500, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year', isActive: true,
    },
    {
        id: 'fund_009', schemeCode: 'INF789F01YN6', schemeName: 'Parag Parikh Flexi Cap Direct Growth',
        fundHouse: 'PPFAS Mutual Fund', category: 'HYBRID', riskLevel: 'HIGH',
        nav: 62.17, aum: 52100, expenseRatio: 0.63, return1y: 24.5, return3y: 18.9, return5y: 17.8,
        minSipAmount: 1000, minLumpsum: 5000, exitLoad: '2% if redeemed within 365 days', isActive: true,
    },
    {
        id: 'fund_010', schemeCode: 'INF200K01SC1', schemeName: 'SBI Magnum Gilt Direct Growth',
        fundHouse: 'SBI Mutual Fund', category: 'GILT', riskLevel: 'MODERATE',
        nav: 56.89, aum: 8900, expenseRatio: 0.43, return1y: 9.1, return3y: 7.2, return5y: 8.1,
        minSipAmount: 500, minLumpsum: 5000, exitLoad: 'Nil', isActive: true,
    },
    {
        id: 'fund_011', schemeCode: 'INF846K01EL5', schemeName: 'Axis ELSS Tax Saver Direct Growth',
        fundHouse: 'Axis Mutual Fund', category: 'ELSS', riskLevel: 'HIGH',
        nav: 78.56, aum: 35200, expenseRatio: 0.56, return1y: 20.3, return3y: 16.1, return5y: 15.7,
        minSipAmount: 500, minLumpsum: 500, exitLoad: '3 year lock-in', isActive: true,
    },
    {
        id: 'fund_012', schemeCode: 'INF204KB14I2', schemeName: 'Nippon India Nifty 50 Index Direct Growth',
        fundHouse: 'Nippon India', category: 'INDEX', riskLevel: 'HIGH',
        nav: 32.45, aum: 15600, expenseRatio: 0.12, return1y: 14.8, return3y: 13.5, return5y: 13.1,
        minSipAmount: 500, minLumpsum: 1000, exitLoad: 'Nil', isActive: true,
    },
];

// ── NAV History (last 12 months) ────────────────
function generateNavHistory(baseNav: number, volatility: number): NavHistory[] {
    const history: NavHistory[] = [];
    let currentNav = baseNav * 0.85;
    const now = new Date();

    for (let i = 360; i >= 0; i -= 3) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        currentNav += (Math.random() - 0.4) * volatility;
        currentNav = Math.max(currentNav * 0.8, currentNav);
        history.push({ date: date.toISOString().split('T')[0], nav: Math.round(currentNav * 100) / 100 });
    }

    // Ensure last entry matches current NAV
    history[history.length - 1].nav = baseNav;
    return history;
}

export const navHistoryMap = new Map<string, NavHistory[]>();
funds.forEach((f) => {
    const vol = f.riskLevel === 'VERY_HIGH' ? 3 : f.riskLevel === 'HIGH' ? 1.5 : 0.5;
    navHistoryMap.set(f.id, generateNavHistory(f.nav, vol));
});

// ── SIP Plans & Orders ──────────────────────────
export const sipPlans: SipPlan[] = [
    {
        id: 'sip_001', userId: 'usr_demo_001', fundId: 'fund_001',
        amount: 5000, frequency: 'MONTHLY', sipDate: 5,
        startDate: '2024-06-01', status: 'ACTIVE', totalInvested: 45000,
        nextSipDate: '2026-04-05', createdAt: '2024-06-01T10:00:00Z',
    },
    {
        id: 'sip_002', userId: 'usr_demo_001', fundId: 'fund_009',
        amount: 10000, frequency: 'MONTHLY', sipDate: 15,
        startDate: '2024-03-01', status: 'ACTIVE', totalInvested: 120000,
        nextSipDate: '2026-04-15', createdAt: '2024-03-01T10:00:00Z',
    },
    {
        id: 'sip_003', userId: 'usr_demo_001', fundId: 'fund_011',
        amount: 2500, frequency: 'MONTHLY', sipDate: 1,
        startDate: '2025-01-01', status: 'ACTIVE', totalInvested: 7500,
        nextSipDate: '2026-04-01', createdAt: '2025-01-01T10:00:00Z',
    },
];

export const mfOrders: MfOrder[] = [
    { id: 'ord_001', userId: 'usr_demo_001', fundId: 'fund_001', orderType: 'LUMPSUM', amount: 50000, nav: 48.12, units: 1039.07, status: 'ALLOTTED', bseOrderId: 'BSE20250115001', createdAt: '2025-01-15T10:00:00Z' },
    { id: 'ord_002', userId: 'usr_demo_001', fundId: 'fund_002', orderType: 'LUMPSUM', amount: 25000, nav: 72.45, units: 345.07, status: 'ALLOTTED', bseOrderId: 'BSE20250215001', createdAt: '2025-02-15T10:00:00Z' },
    { id: 'ord_003', userId: 'usr_demo_001', fundId: 'fund_009', orderType: 'SIP', amount: 10000, nav: 58.34, units: 171.41, status: 'ALLOTTED', createdAt: '2025-03-01T10:00:00Z' },
    { id: 'ord_004', userId: 'usr_demo_001', fundId: 'fund_004', orderType: 'LUMPSUM', amount: 100000, nav: 128.56, units: 777.85, status: 'ALLOTTED', bseOrderId: 'BSE20250101002', createdAt: '2025-01-01T10:00:00Z' },
    { id: 'ord_005', userId: 'usr_demo_001', fundId: 'fund_011', orderType: 'SIP', amount: 2500, nav: 75.90, units: 32.94, status: 'ALLOTTED', createdAt: '2025-03-01T10:00:00Z' },
    { id: 'ord_006', userId: 'usr_demo_001', fundId: 'fund_008', orderType: 'LUMPSUM', amount: 30000, nav: 85.20, units: 352.11, status: 'ALLOTTED', bseOrderId: 'BSE20250220001', createdAt: '2025-02-20T10:00:00Z' },
    { id: 'ord_007', userId: 'usr_demo_001', fundId: 'fund_012', orderType: 'LUMPSUM', amount: 20000, nav: 30.12, units: 663.91, status: 'ALLOTTED', bseOrderId: 'BSE20250305001', createdAt: '2025-03-05T10:00:00Z' },
];
