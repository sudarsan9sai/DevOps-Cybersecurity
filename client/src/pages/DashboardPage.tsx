import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ── Mock Data (used when API is unavailable) ────
const mockSummary = {
    totalInvested: 225000, currentValue: 268540.50, totalPnl: 43540.50,
    totalPnlPercent: 19.35, xirr: 24.8, dayChange: 1245.30, dayChangePercent: 0.47, holdingsCount: 7,
};

const mockHoldings = [
    { fundId: 'fund_001', schemeName: 'Axis Bluechip Fund Direct Growth', fundHouse: 'Axis MF', category: 'EQUITY', invested: 95000, currentValue: 112350, pnl: 17350, pnlPercent: 18.26, dayChange: 1.2 },
    { fundId: 'fund_002', schemeName: 'HDFC Mid-Cap Opportunities Direct', fundHouse: 'HDFC MF', category: 'EQUITY', invested: 25000, currentValue: 31240, pnl: 6240, pnlPercent: 24.96, dayChange: -0.5 },
    { fundId: 'fund_004', schemeName: 'SBI Small Cap Fund Direct Growth', fundHouse: 'SBI MF', category: 'EQUITY', invested: 100000, currentValue: 118750, pnl: 18750, pnlPercent: 18.75, dayChange: 2.1 },
    { fundId: 'fund_008', schemeName: 'Mirae Asset Large Cap Direct', fundHouse: 'Mirae Asset', category: 'EQUITY', invested: 30000, currentValue: 33680, pnl: 3680, pnlPercent: 12.27, dayChange: 0.8 },
    { fundId: 'fund_009', schemeName: 'Parag Parikh Flexi Cap Direct', fundHouse: 'PPFAS MF', category: 'HYBRID', invested: 120000, currentValue: 142500, pnl: 22500, pnlPercent: 18.75, dayChange: 1.5 },
    { fundId: 'fund_011', schemeName: 'Axis ELSS Tax Saver Direct', fundHouse: 'Axis MF', category: 'ELSS', invested: 7500, currentValue: 8120, pnl: 620, pnlPercent: 8.27, dayChange: 0.3 },
    { fundId: 'fund_012', schemeName: 'Nippon India Nifty 50 Index Direct', fundHouse: 'Nippon India', category: 'INDEX', invested: 20000, currentValue: 21540, pnl: 1540, pnlPercent: 7.7, dayChange: 0.6 },
];

const mockAllocation = [
    { category: 'EQUITY', value: 296020, percentage: 65.2 },
    { category: 'HYBRID', value: 142500, percentage: 22.1 },
    { category: 'INDEX', value: 21540, percentage: 4.8 },
    { category: 'ELSS', value: 8120, percentage: 7.9 },
];

const COLORS = ['#00c982', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

// Portfolio performance chart (last 12 months)
const perfData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, 3 + i, 1);
    const base = 200000 + i * 5500 + Math.random() * 3000;
    return {
        month: month.toLocaleDateString('en-IN', { month: 'short' }),
        value: Math.round(base),
        invested: 200000 + i * 2000,
    };
});

export default function DashboardPage() {
    const [summary] = useState(mockSummary);
    const [holdings] = useState(mockHoldings);
    const [allocation] = useState(mockAllocation);

    const formatCurrency = (n: number) =>
        '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Portfolio Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Last updated: {new Date().toLocaleTimeString('en-IN')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Value</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.currentValue)}</p>
                    <p className={`text-sm mt-1 ${summary.dayChange >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {summary.dayChange >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(summary.dayChange))} ({summary.dayChangePercent}%) today
                    </p>
                </div>

                <div className="stat-card">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Invested</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalInvested)}</p>
                    <p className="text-sm text-gray-500 mt-1">{summary.holdingsCount} holdings</p>
                </div>

                <div className="stat-card">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total P&L</p>
                    <p className={`text-2xl font-bold ${summary.totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {summary.totalPnl >= 0 ? '+' : ''}{formatCurrency(summary.totalPnl)}
                    </p>
                    <p className={`text-sm mt-1 ${summary.totalPnlPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {summary.totalPnlPercent >= 0 ? '+' : ''}{summary.totalPnlPercent}%
                    </p>
                </div>

                <div className="stat-card">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">XIRR</p>
                    <p className="text-2xl font-bold text-accent-purple">{summary.xirr}%</p>
                    <p className="text-sm text-gray-500 mt-1">Annualized return</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio Performance Chart */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Portfolio Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={perfData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00c982" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00c982" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }}
                                formatter={(value: number) => [formatCurrency(value), '']}
                            />
                            <Area type="monotone" dataKey="invested" stroke="#3b82f6" fill="url(#colorInvested)" strokeWidth={2} name="Invested" />
                            <Area type="monotone" dataKey="value" stroke="#00c982" fill="url(#colorValue)" strokeWidth={2} name="Current" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Asset Allocation Pie */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={allocation} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                                {allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }}
                                formatter={(value: number) => [formatCurrency(value), '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-3">
                        {allocation.map((item, i) => (
                            <div key={item.category} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-gray-400">{item.category}</span>
                                </div>
                                <span className="font-medium text-white">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">Holdings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Fund</th>
                                <th className="text-right p-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Invested</th>
                                <th className="text-right p-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Current</th>
                                <th className="text-right p-4 text-xs text-gray-400 uppercase tracking-wider font-medium">P&L</th>
                                <th className="text-right p-4 text-xs text-gray-400 uppercase tracking-wider font-medium">Day</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map((h) => (
                                <tr key={h.fundId} className="border-b border-white/5 hover:bg-surface-hover/50 transition-colors cursor-pointer">
                                    <td className="p-4">
                                        <p className="font-medium text-white text-sm">{h.schemeName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{h.fundHouse}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="text-sm text-gray-300">{formatCurrency(h.invested)}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="text-sm font-medium text-white">{formatCurrency(h.currentValue)}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className={`text-sm font-medium ${h.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                                            {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                                        </p>
                                        <p className={`text-xs ${h.pnlPercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                                            {h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent}%
                                        </p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`text-sm ${h.dayChange >= 0 ? 'text-gain' : 'text-loss'}`}>
                                            {h.dayChange >= 0 ? '▲' : '▼'} {Math.abs(h.dayChange)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Active SIPs */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Active SIPs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { fund: 'Axis Bluechip Fund', amount: 5000, date: '5th', next: '5 Apr 2026' },
                        { fund: 'Parag Parikh Flexi Cap', amount: 10000, date: '15th', next: '15 Apr 2026' },
                        { fund: 'Axis ELSS Tax Saver', amount: 2500, date: '1st', next: '1 Apr 2026' },
                    ].map((sip) => (
                        <div key={sip.fund} className="bg-surface-elevated/50 rounded-xl p-4 border border-white/5 hover:border-brand-500/20 transition-colors">
                            <p className="font-medium text-white text-sm mb-2">{sip.fund}</p>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Amount</p>
                                    <p className="text-sm font-semibold text-brand-400">{formatCurrency(sip.amount)}/mo</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Next SIP</p>
                                    <p className="text-sm text-gray-300">{sip.next}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                                <span className="text-xs text-accent-green">Active</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
