import { funds, mfOrders } from '../funds/funds.data';

// ── XIRR Calculation (Newton-Raphson) ───────────

function xirr(cashflows: { amount: number; date: Date }[]): number {
    if (cashflows.length < 2) return 0;

    const daysInYear = 365.25;
    const firstDate = cashflows[0].date;

    function npv(rate: number): number {
        return cashflows.reduce((sum, cf) => {
            const years = (cf.date.getTime() - firstDate.getTime()) / (daysInYear * 24 * 60 * 60 * 1000);
            return sum + cf.amount / Math.pow(1 + rate, years);
        }, 0);
    }

    function npvDerivative(rate: number): number {
        return cashflows.reduce((sum, cf) => {
            const years = (cf.date.getTime() - firstDate.getTime()) / (daysInYear * 24 * 60 * 60 * 1000);
            return sum - (years * cf.amount) / Math.pow(1 + rate, years + 1);
        }, 0);
    }

    // Newton-Raphson
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
        const value = npv(rate);
        const derivative = npvDerivative(rate);
        if (Math.abs(derivative) < 1e-10) break;
        const newRate = rate - value / derivative;
        if (Math.abs(newRate - rate) < 1e-7) break;
        rate = newRate;
    }

    return Math.round(rate * 10000) / 100; // Return as percentage
}

// ── Portfolio Service ───────────────────────────

export async function getHoldings(userId: string) {
    const allottedOrders = mfOrders.filter((o) => o.userId === userId && o.status === 'ALLOTTED');

    // Group by fund
    const holdingsMap = new Map<string, { units: number; invested: number }>();
    allottedOrders.forEach((order) => {
        const existing = holdingsMap.get(order.fundId) || { units: 0, invested: 0 };
        existing.units += order.units;
        existing.invested += order.amount;
        holdingsMap.set(order.fundId, existing);
    });

    const holdings = Array.from(holdingsMap.entries()).map(([fundId, data]) => {
        const fund = funds.find((f) => f.id === fundId);
        if (!fund) return null;

        const currentValue = data.units * fund.nav;
        const pnl = currentValue - data.invested;
        const pnlPercent = (pnl / data.invested) * 100;

        return {
            fundId,
            schemeName: fund.schemeName,
            fundHouse: fund.fundHouse,
            category: fund.category,
            riskLevel: fund.riskLevel,
            units: Math.round(data.units * 10000) / 10000,
            avgNav: Math.round((data.invested / data.units) * 10000) / 10000,
            currentNav: fund.nav,
            invested: Math.round(data.invested * 100) / 100,
            currentValue: Math.round(currentValue * 100) / 100,
            pnl: Math.round(pnl * 100) / 100,
            pnlPercent: Math.round(pnlPercent * 100) / 100,
            dayChange: Math.round((Math.random() * 2 - 0.5) * 100) / 100,
        };
    }).filter(Boolean);

    return holdings;
}

export async function getPortfolioSummary(userId: string) {
    const holdings = await getHoldings(userId);

    const totalInvested = holdings.reduce((sum, h) => sum + (h?.invested || 0), 0);
    const totalCurrent = holdings.reduce((sum, h) => sum + (h?.currentValue || 0), 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Calculate XIRR
    const cashflows = mfOrders
        .filter((o) => o.userId === userId && o.status === 'ALLOTTED')
        .map((o) => ({ amount: -o.amount, date: new Date(o.createdAt) }));

    // Add current portfolio value as the last cashflow
    if (cashflows.length > 0) {
        cashflows.push({ amount: totalCurrent, date: new Date() });
    }

    const xirrValue = xirr(cashflows);

    return {
        totalInvested: Math.round(totalInvested * 100) / 100,
        currentValue: Math.round(totalCurrent * 100) / 100,
        totalPnl: Math.round(totalPnl * 100) / 100,
        totalPnlPercent: Math.round(totalPnlPercent * 100) / 100,
        xirr: xirrValue,
        holdingsCount: holdings.length,
        dayChange: Math.round((totalCurrent * 0.008) * 100) / 100,
        dayChangePercent: 0.8,
    };
}

export async function getAssetAllocation(userId: string) {
    const holdings = await getHoldings(userId);
    const totalValue = holdings.reduce((sum, h) => sum + (h?.currentValue || 0), 0);

    const allocationMap = new Map<string, number>();
    holdings.forEach((h) => {
        if (!h) return;
        const existing = allocationMap.get(h.category) || 0;
        allocationMap.set(h.category, existing + h.currentValue);
    });

    const allocation = Array.from(allocationMap.entries()).map(([category, value]) => ({
        category,
        value: Math.round(value * 100) / 100,
        percentage: Math.round((value / totalValue) * 10000) / 100,
    }));

    return { allocation, totalValue: Math.round(totalValue * 100) / 100 };
}

export async function getTransactions(userId: string, page = 1, limit = 20) {
    const orders = mfOrders
        .filter((o) => o.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = orders.length;
    const paginated = orders.slice((page - 1) * limit, page * limit);

    const transactions = paginated.map((order) => {
        const fund = funds.find((f) => f.id === order.fundId);
        return {
            ...order,
            fundName: fund?.schemeName || 'Unknown',
            fundHouse: fund?.fundHouse || 'Unknown',
        };
    });

    return { transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
