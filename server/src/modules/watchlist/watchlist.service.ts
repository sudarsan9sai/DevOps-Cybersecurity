import { v4 as uuid } from 'uuid';
import { funds } from '../funds/funds.data';

// ── Watchlist & Discovery Data ──────────────────

export interface WatchlistItem {
    id: string;
    userId: string;
    fundId?: string;
    assetType: string;
    assetCode: string;
    assetName: string;
    createdAt: string;
}

export interface PriceAlert {
    id: string;
    userId: string;
    fundId?: string;
    assetCode: string;
    assetName: string;
    targetPrice: number;
    condition: string;
    triggered: boolean;
    createdAt: string;
}

export const watchlistItems: WatchlistItem[] = [
    { id: 'wl_001', userId: 'usr_demo_001', fundId: 'fund_003', assetType: 'MUTUAL_FUND', assetCode: 'INF109K01Z48', assetName: 'ICICI Prudential Technology Direct Growth', createdAt: '2025-02-01T10:00:00Z' },
    { id: 'wl_002', userId: 'usr_demo_001', fundId: 'fund_005', assetType: 'MUTUAL_FUND', assetCode: 'INF173K01FQ4', assetName: 'Kotak Equity Opportunities Direct Growth', createdAt: '2025-02-15T10:00:00Z' },
    { id: 'wl_003', userId: 'usr_demo_001', assetType: 'STOCK', assetCode: 'RELIANCE', assetName: 'Reliance Industries Ltd', createdAt: '2025-03-01T10:00:00Z' },
    { id: 'wl_004', userId: 'usr_demo_001', assetType: 'STOCK', assetCode: 'TCS', assetName: 'Tata Consultancy Services Ltd', createdAt: '2025-03-05T10:00:00Z' },
];

export const priceAlerts: PriceAlert[] = [
    { id: 'alert_001', userId: 'usr_demo_001', fundId: 'fund_003', assetCode: 'INF109K01Z48', assetName: 'ICICI Prudential Technology', targetPrice: 150, condition: 'ABOVE', triggered: false, createdAt: '2025-02-01T10:00:00Z' },
    { id: 'alert_002', userId: 'usr_demo_001', assetCode: 'RELIANCE', assetName: 'Reliance Industries', targetPrice: 2400, condition: 'BELOW', triggered: false, createdAt: '2025-03-01T10:00:00Z' },
];

// ── Service ─────────────────────────────────────

export async function searchAssets(query: string) {
    const q = query.toLowerCase();

    // Search mutual funds
    const fundResults = funds
        .filter((f) => f.schemeName.toLowerCase().includes(q) || f.fundHouse.toLowerCase().includes(q) || f.schemeCode.toLowerCase().includes(q))
        .map((f) => ({
            type: 'MUTUAL_FUND',
            code: f.schemeCode,
            name: f.schemeName,
            fundHouse: f.fundHouse,
            category: f.category,
            nav: f.nav,
            return1y: f.return1y,
            id: f.id,
        }));

    // Mock stock search
    const stockData = [
        { code: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2567.80, change: 1.24 - 0.10 },
        { code: 'TCS', name: 'Tata Consultancy Services Ltd', price: 3890.50, change: 0.85 },
        { code: 'INFY', name: 'Infosys Ltd', price: 1567.25, change: -0.45 },
        { code: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1623.40, change: 0.92 },
        { code: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1089.75, change: 1.15 },
        { code: 'WIPRO', name: 'Wipro Ltd', price: 456.30, change: -0.78 },
        { code: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 789.60, change: 2.34 },
        { code: 'LT', name: 'Larsen & Toubro Ltd', price: 3456.90, change: 0.56 },
        { code: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 6789.45, change: -1.23 },
        { code: 'MARUTI', name: 'Maruti Suzuki India Ltd', price: 10234.50, change: 0.67 },
    ];

    const stockResults = stockData
        .filter((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
        .map((s) => ({ type: 'STOCK', ...s }));

    return [...fundResults, ...stockResults];
}

export async function getTrending() {
    const topFunds = funds
        .sort((a, b) => b.return1y - a.return1y)
        .slice(0, 5)
        .map((f) => ({
            type: 'MUTUAL_FUND',
            id: f.id,
            code: f.schemeCode,
            name: f.schemeName,
            fundHouse: f.fundHouse,
            return1y: f.return1y,
            nav: f.nav,
            category: f.category,
        }));

    return { trending: topFunds, lastUpdated: new Date().toISOString() };
}

export async function getWatchlist(userId: string) {
    const items = watchlistItems.filter((w) => w.userId === userId);

    return items.map((item) => {
        const fund = item.fundId ? funds.find((f) => f.id === item.fundId) : null;
        return {
            ...item,
            currentPrice: fund ? fund.nav : (Math.random() * 5000 + 500).toFixed(2),
            change: (Math.random() * 4 - 1).toFixed(2),
            changePercent: (Math.random() * 3 - 0.5).toFixed(2),
        };
    });
}

export async function addToWatchlist(userId: string, data: { assetType: string; assetCode: string; assetName: string; fundId?: string }) {
    const existing = watchlistItems.find((w) => w.userId === userId && w.assetCode === data.assetCode);
    if (existing) throw { statusCode: 409, message: 'Already in watchlist' };

    const item: WatchlistItem = {
        id: `wl_${uuid().slice(0, 8)}`,
        userId,
        fundId: data.fundId,
        assetType: data.assetType,
        assetCode: data.assetCode,
        assetName: data.assetName,
        createdAt: new Date().toISOString(),
    };

    watchlistItems.push(item);
    return item;
}

export async function removeFromWatchlist(userId: string, itemId: string) {
    const idx = watchlistItems.findIndex((w) => w.id === itemId && w.userId === userId);
    if (idx === -1) throw { statusCode: 404, message: 'Watchlist item not found' };
    watchlistItems.splice(idx, 1);
    return { message: 'Removed from watchlist' };
}

export async function createPriceAlert(userId: string, data: { assetCode: string; assetName: string; targetPrice: number; condition: string; fundId?: string }) {
    const alert: PriceAlert = {
        id: `alert_${uuid().slice(0, 8)}`,
        userId,
        fundId: data.fundId,
        assetCode: data.assetCode,
        assetName: data.assetName,
        targetPrice: data.targetPrice,
        condition: data.condition || 'ABOVE',
        triggered: false,
        createdAt: new Date().toISOString(),
    };

    priceAlerts.push(alert);
    return alert;
}

export async function getAlerts(userId: string) {
    return priceAlerts.filter((a) => a.userId === userId);
}
