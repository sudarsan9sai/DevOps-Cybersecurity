import { v4 as uuid } from 'uuid';
import { funds, navHistoryMap, sipPlans, mfOrders, MfOrder, SipPlan } from './funds.data';

// ── Browse & Search ─────────────────────────────

export interface FundFilters {
    category?: string;
    riskLevel?: string;
    fundHouse?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
}

export async function browseFunds(filters: FundFilters) {
    let result = [...funds].filter((f) => f.isActive);

    if (filters.category) result = result.filter((f) => f.category === filters.category.toUpperCase());
    if (filters.riskLevel) result = result.filter((f) => f.riskLevel === filters.riskLevel.toUpperCase());
    if (filters.fundHouse) result = result.filter((f) => f.fundHouse.toLowerCase().includes(filters.fundHouse!.toLowerCase()));
    if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter((f) => f.schemeName.toLowerCase().includes(q) || f.fundHouse.toLowerCase().includes(q));
    }

    // Sort
    const sortBy = filters.sortBy || 'return1y';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    result.sort((a, b) => {
        const aVal = (a as any)[sortBy] || 0;
        const bVal = (b as any)[sortBy] || 0;
        return (aVal - bVal) * sortOrder;
    });

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const total = result.length;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
        funds: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getFundDetail(fundId: string) {
    const fund = funds.find((f) => f.id === fundId);
    if (!fund) throw { statusCode: 404, message: 'Fund not found' };

    const navHistory = navHistoryMap.get(fundId) || [];

    return { ...fund, navHistory };
}

// ── SIP ─────────────────────────────────────────

export async function createSip(userId: string, data: { fundId: string; amount: number; sipDate: number; startDate: string; endDate?: string }) {
    const fund = funds.find((f) => f.id === data.fundId);
    if (!fund) throw { statusCode: 404, message: 'Fund not found' };
    if (data.amount < fund.minSipAmount) {
        throw { statusCode: 400, message: `Minimum SIP amount for this fund is ₹${fund.minSipAmount}` };
    }
    if (data.sipDate < 1 || data.sipDate > 28) {
        throw { statusCode: 400, message: 'SIP date must be between 1 and 28' };
    }

    const sip: SipPlan = {
        id: `sip_${uuid().slice(0, 8)}`,
        userId,
        fundId: data.fundId,
        amount: data.amount,
        frequency: 'MONTHLY',
        sipDate: data.sipDate,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'ACTIVE',
        totalInvested: 0,
        nextSipDate: data.startDate,
        createdAt: new Date().toISOString(),
    };

    sipPlans.push(sip);

    return { sip, fund: { schemeName: fund.schemeName, fundHouse: fund.fundHouse } };
}

export async function getUserSips(userId: string) {
    const userSips = sipPlans.filter((s) => s.userId === userId);
    return userSips.map((sip) => {
        const fund = funds.find((f) => f.id === sip.fundId);
        return { ...sip, fund: fund ? { schemeName: fund.schemeName, fundHouse: fund.fundHouse, nav: fund.nav, category: fund.category } : null };
    });
}

export async function modifySip(userId: string, sipId: string, data: { amount?: number; status?: string }) {
    const sip = sipPlans.find((s) => s.id === sipId && s.userId === userId);
    if (!sip) throw { statusCode: 404, message: 'SIP plan not found' };

    if (data.amount) sip.amount = data.amount;
    if (data.status) sip.status = data.status;

    return sip;
}

export async function cancelSip(userId: string, sipId: string) {
    const sip = sipPlans.find((s) => s.id === sipId && s.userId === userId);
    if (!sip) throw { statusCode: 404, message: 'SIP plan not found' };

    sip.status = 'CANCELLED';
    return { message: 'SIP cancelled successfully', sipId };
}

// ── Lumpsum Purchase ────────────────────────────

export async function lumpsumPurchase(userId: string, data: { fundId: string; amount: number }) {
    const fund = funds.find((f) => f.id === data.fundId);
    if (!fund) throw { statusCode: 404, message: 'Fund not found' };
    if (data.amount < fund.minLumpsum) {
        throw { statusCode: 400, message: `Minimum lumpsum amount is ₹${fund.minLumpsum}` };
    }

    const units = data.amount / fund.nav;

    const order: MfOrder = {
        id: `ord_${uuid().slice(0, 8)}`,
        userId,
        fundId: data.fundId,
        orderType: 'LUMPSUM',
        amount: data.amount,
        nav: fund.nav,
        units: Math.round(units * 10000) / 10000,
        status: 'CONFIRMED',
        bseOrderId: `BSE${Date.now()}`,
        createdAt: new Date().toISOString(),
    };

    mfOrders.push(order);

    // Simulate allotment after 1s
    setTimeout(() => { order.status = 'ALLOTTED'; }, 1000);

    return {
        order,
        fund: { schemeName: fund.schemeName, fundHouse: fund.fundHouse, nav: fund.nav },
        message: `Order placed for ${units.toFixed(4)} units of ${fund.schemeName}`,
    };
}

// ── Orders ──────────────────────────────────────

export async function getUserOrders(userId: string, status?: string) {
    let orders = mfOrders.filter((o) => o.userId === userId);
    if (status) orders = orders.filter((o) => o.status === status);

    return orders.map((order) => {
        const fund = funds.find((f) => f.id === order.fundId);
        return {
            ...order,
            fund: fund ? { schemeName: fund.schemeName, fundHouse: fund.fundHouse, category: fund.category } : null,
        };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
