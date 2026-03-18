// ── API Client ──────────────────────────────────

const BASE_URL = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options?.headers,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error?.message || 'Request failed');
    }

    return data.data;
}

export const api = {
    // Auth
    sendOtp: (mobile: string) => fetchApi('/auth/send-otp', { method: 'POST', body: JSON.stringify({ mobile }) }),
    verifyOtp: (mobile: string, otp: string) => fetchApi<any>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ mobile, otp }) }),
    getProfile: () => fetchApi<any>('/auth/profile'),

    // KYC
    verifyPan: (panNumber: string) => fetchApi<any>('/kyc/verify-pan', { method: 'POST', body: JSON.stringify({ panNumber }) }),
    verifyAadhaar: (aadhaarNumber: string) => fetchApi<any>('/kyc/verify-aadhaar', { method: 'POST', body: JSON.stringify({ aadhaarNumber }) }),
    submitVideoKyc: (videoUrl: string) => fetchApi<any>('/kyc/video-kyc', { method: 'POST', body: JSON.stringify({ videoUrl }) }),
    getKycStatus: () => fetchApi<any>('/kyc/status'),

    // Funds
    browseFunds: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return fetchApi<any>(`/funds${query}`);
    },
    getFund: (id: string) => fetchApi<any>(`/funds/${id}`),
    createSip: (data: any) => fetchApi<any>('/funds/sip', { method: 'POST', body: JSON.stringify(data) }),
    purchase: (data: any) => fetchApi<any>('/funds/purchase', { method: 'POST', body: JSON.stringify(data) }),
    getOrders: () => fetchApi<any>('/funds/orders'),
    getSips: () => fetchApi<any>('/funds/sip'),

    // Portfolio
    getHoldings: () => fetchApi<any>('/portfolio/holdings'),
    getSummary: () => fetchApi<any>('/portfolio/summary'),
    getAllocation: () => fetchApi<any>('/portfolio/allocation'),
    getTransactions: () => fetchApi<any>('/portfolio/transactions'),

    // Watchlist
    getWatchlist: () => fetchApi<any>('/watchlist'),
    addToWatchlist: (data: any) => fetchApi<any>('/watchlist', { method: 'POST', body: JSON.stringify(data) }),
    removeFromWatchlist: (id: string) => fetchApi<any>(`/watchlist/${id}`, { method: 'DELETE' }),

    // Discover
    search: (q: string) => fetchApi<any>(`/discover/search?q=${q}`),
    trending: () => fetchApi<any>('/discover/trending'),

    // Notifications
    getNotifications: () => fetchApi<any>('/notifications'),
    markRead: (id: string) => fetchApi<any>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => fetchApi<any>('/notifications/read-all', { method: 'PUT' }),

    // Payments
    getPaymentHistory: () => fetchApi<any>('/payments/history'),
    getBankAccounts: () => fetchApi<any>('/payments/bank-accounts'),
};
