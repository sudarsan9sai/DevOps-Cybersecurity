import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock fund data
const fundsMap: Record<string, any> = {
    fund_001: { id: 'fund_001', schemeName: 'Axis Bluechip Fund Direct Growth', fundHouse: 'Axis Mutual Fund', category: 'EQUITY', riskLevel: 'HIGH', nav: 52.34, return1y: 18.5, return3y: 15.2, return5y: 14.8, aum: 34521, expenseRatio: 0.49, minSipAmount: 500, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year' },
    fund_002: { id: 'fund_002', schemeName: 'HDFC Mid-Cap Opportunities Direct Growth', fundHouse: 'HDFC Mutual Fund', category: 'EQUITY', riskLevel: 'VERY_HIGH', nav: 78.92, return1y: 32.1, return3y: 22.8, return5y: 19.5, aum: 42156, expenseRatio: 0.74, minSipAmount: 500, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year' },
    fund_003: { id: 'fund_003', schemeName: 'ICICI Prudential Technology Direct Growth', fundHouse: 'ICICI Prudential', category: 'SECTORAL', riskLevel: 'VERY_HIGH', nav: 145.67, return1y: 42.3, return3y: 28.1, return5y: 24.6, aum: 12340, expenseRatio: 0.99, minSipAmount: 1000, minLumpsum: 5000, exitLoad: '1% if redeemed within 15 days' },
    fund_004: { id: 'fund_004', schemeName: 'SBI Small Cap Fund Direct Growth', fundHouse: 'SBI Mutual Fund', category: 'EQUITY', riskLevel: 'VERY_HIGH', nav: 134.21, return1y: 28.7, return3y: 20.4, return5y: 22.1, aum: 26780, expenseRatio: 0.62, minSipAmount: 500, minLumpsum: 5000, exitLoad: '1% if redeemed within 1 year' },
    fund_009: { id: 'fund_009', schemeName: 'Parag Parikh Flexi Cap Direct Growth', fundHouse: 'PPFAS Mutual Fund', category: 'HYBRID', riskLevel: 'HIGH', nav: 62.17, return1y: 24.5, return3y: 18.9, return5y: 17.8, aum: 52100, expenseRatio: 0.63, minSipAmount: 1000, minLumpsum: 5000, exitLoad: '2% if redeemed within 365 days' },
};

function generateNavChart(baseNav: number): { date: string; nav: number }[] {
    const data = [];
    let current = baseNav * 0.82;
    for (let i = 365; i >= 0; i -= 3) {
        const d = new Date(); d.setDate(d.getDate() - i);
        current += (Math.random() - 0.38) * (baseNav * 0.015);
        current = Math.max(current, baseNav * 0.6);
        data.push({ date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), nav: Math.round(current * 100) / 100 });
    }
    data[data.length - 1].nav = baseNav;
    return data;
}

export default function FundDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [investType, setInvestType] = useState<'SIP' | 'LUMPSUM'>('SIP');
    const [amount, setAmount] = useState('');
    const [sipDate, setSipDate] = useState('5');
    const [showInvestModal, setShowInvestModal] = useState(false);

    const fund = fundsMap[id || ''] || fundsMap.fund_001;
    const navData = generateNavChart(fund.nav);

    const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN');

    const handleInvest = () => {
        alert(`✅ ${investType} order placed!\nFund: ${fund.schemeName}\nAmount: ₹${amount}\n${investType === 'SIP' ? `SIP Date: ${sipDate}th of each month` : ''}`);
        setShowInvestModal(false);
        setAmount('');
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Back Button */}
            <button onClick={() => navigate('/funds')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
                ← Back to Funds
            </button>

            {/* Fund Header */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">{fund.schemeName}</h1>
                        <p className="text-gray-400 mt-1">{fund.fundHouse} • {fund.category}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-2xl font-bold text-white">{formatCurrency(fund.nav)}</span>
                            <span className="text-sm text-gain">▲ 0.85% today</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary" onClick={() => alert('Added to watchlist!')}>⭐ Watchlist</button>
                        <button className="btn-primary" onClick={() => setShowInvestModal(true)}>Invest Now</button>
                    </div>
                </div>
            </div>

            {/* NAV Chart */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">NAV Performance (1 Year)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={navData}>
                        <defs>
                            <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00c982" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00c982" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} interval={15} />
                        <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }} />
                        <Area type="monotone" dataKey="nav" stroke="#00c982" fill="url(#navGrad)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Returns & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Returns</h3>
                    <div className="space-y-4">
                        {[
                            { label: '1 Year', value: fund.return1y },
                            { label: '3 Years', value: fund.return3y },
                            { label: '5 Years', value: fund.return5y },
                        ].map((r) => (
                            <div key={r.label} className="flex justify-between items-center">
                                <span className="text-gray-400">{r.label}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-surface-elevated rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full" style={{ width: `${Math.min(r.value * 2, 100)}%` }} />
                                    </div>
                                    <span className="text-sm font-semibold text-gain w-16 text-right">+{r.value}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Fund Details</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'AUM', value: `₹${(fund.aum).toLocaleString()} Cr` },
                            { label: 'Expense Ratio', value: `${fund.expenseRatio}%` },
                            { label: 'Min SIP', value: formatCurrency(fund.minSipAmount) },
                            { label: 'Min Lumpsum', value: formatCurrency(fund.minLumpsum) },
                            { label: 'Exit Load', value: fund.exitLoad },
                            { label: 'Risk', value: fund.riskLevel.replace('_', ' ') },
                        ].map((d) => (
                            <div key={d.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                <span className="text-gray-400 text-sm">{d.label}</span>
                                <span className="text-white text-sm font-medium">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invest Modal */}
            {showInvestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Invest in {fund.schemeName.split(' ').slice(0, 3).join(' ')}</h3>
                            <button onClick={() => setShowInvestModal(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
                        </div>

                        {/* SIP / Lumpsum Toggle */}
                        <div className="flex bg-surface-elevated/50 rounded-xl p-1 mb-6">
                            {(['SIP', 'LUMPSUM'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setInvestType(type)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${investType === type ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {type === 'SIP' ? 'Monthly SIP' : 'One-Time'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    className="input-field text-lg"
                                    placeholder={investType === 'SIP' ? `Min ₹${fund.minSipAmount}` : `Min ₹${fund.minLumpsum}`}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            {investType === 'SIP' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">SIP Date (monthly)</label>
                                    <select className="input-field" value={sipDate} onChange={(e) => setSipDate(e.target.value)}>
                                        {[1, 5, 10, 15, 20, 25].map((d) => <option key={d} value={d}>{d}th of every month</option>)}
                                    </select>
                                </div>
                            )}

                            {amount && (
                                <div className="bg-surface-elevated/50 rounded-xl p-4 border border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Estimated Units</span>
                                        <span className="text-white font-mono">{(parseFloat(amount) / fund.nav).toFixed(4)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-400">NAV</span>
                                        <span className="text-white">{formatCurrency(fund.nav)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn-primary w-full text-lg"
                                onClick={handleInvest}
                                disabled={!amount || parseFloat(amount) < (investType === 'SIP' ? fund.minSipAmount : fund.minLumpsum)}
                            >
                                {investType === 'SIP' ? `Start SIP of ₹${amount || '0'}/month` : `Invest ₹${amount || '0'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
