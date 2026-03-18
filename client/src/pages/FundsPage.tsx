import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'EQUITY', 'DEBT', 'HYBRID', 'INDEX', 'ELSS', 'LIQUID', 'GILT', 'SECTORAL'];
const RISK_LEVELS = ['All', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];

const mockFunds = [
    { id: 'fund_003', schemeName: 'ICICI Prudential Technology Direct Growth', fundHouse: 'ICICI Prudential', category: 'SECTORAL', riskLevel: 'VERY_HIGH', nav: 145.67, return1y: 42.3, return3y: 28.1, return5y: 24.6, aum: 12340, expenseRatio: 0.99, minSipAmount: 1000 },
    { id: 'fund_002', schemeName: 'HDFC Mid-Cap Opportunities Direct Growth', fundHouse: 'HDFC Mutual Fund', category: 'EQUITY', riskLevel: 'VERY_HIGH', nav: 78.92, return1y: 32.1, return3y: 22.8, return5y: 19.5, aum: 42156, expenseRatio: 0.74, minSipAmount: 500 },
    { id: 'fund_004', schemeName: 'SBI Small Cap Fund Direct Growth', fundHouse: 'SBI Mutual Fund', category: 'EQUITY', riskLevel: 'VERY_HIGH', nav: 134.21, return1y: 28.7, return3y: 20.4, return5y: 22.1, aum: 26780, expenseRatio: 0.62, minSipAmount: 500 },
    { id: 'fund_009', schemeName: 'Parag Parikh Flexi Cap Direct Growth', fundHouse: 'PPFAS Mutual Fund', category: 'HYBRID', riskLevel: 'HIGH', nav: 62.17, return1y: 24.5, return3y: 18.9, return5y: 17.8, aum: 52100, expenseRatio: 0.63, minSipAmount: 1000 },
    { id: 'fund_005', schemeName: 'Kotak Equity Opportunities Direct Growth', fundHouse: 'Kotak Mutual Fund', category: 'EQUITY', riskLevel: 'HIGH', nav: 267.89, return1y: 22.1, return3y: 17.6, return5y: 16.3, aum: 18920, expenseRatio: 0.52, minSipAmount: 1000 },
    { id: 'fund_011', schemeName: 'Axis ELSS Tax Saver Direct Growth', fundHouse: 'Axis Mutual Fund', category: 'ELSS', riskLevel: 'HIGH', nav: 78.56, return1y: 20.3, return3y: 16.1, return5y: 15.7, aum: 35200, expenseRatio: 0.56, minSipAmount: 500 },
    { id: 'fund_001', schemeName: 'Axis Bluechip Fund Direct Growth', fundHouse: 'Axis Mutual Fund', category: 'EQUITY', riskLevel: 'HIGH', nav: 52.34, return1y: 18.5, return3y: 15.2, return5y: 14.8, aum: 34521, expenseRatio: 0.49, minSipAmount: 500 },
    { id: 'fund_008', schemeName: 'Mirae Asset Large Cap Direct Growth', fundHouse: 'Mirae Asset', category: 'EQUITY', riskLevel: 'HIGH', nav: 89.34, return1y: 16.9, return3y: 14.8, return5y: 15.2, aum: 38400, expenseRatio: 0.53, minSipAmount: 500 },
    { id: 'fund_012', schemeName: 'Nippon India Nifty 50 Index Direct Growth', fundHouse: 'Nippon India', category: 'INDEX', riskLevel: 'HIGH', nav: 32.45, return1y: 14.8, return3y: 13.5, return5y: 13.1, aum: 15600, expenseRatio: 0.12, minSipAmount: 500 },
    { id: 'fund_010', schemeName: 'SBI Magnum Gilt Direct Growth', fundHouse: 'SBI Mutual Fund', category: 'GILT', riskLevel: 'MODERATE', nav: 56.89, return1y: 9.1, return3y: 7.2, return5y: 8.1, aum: 8900, expenseRatio: 0.43, minSipAmount: 500 },
    { id: 'fund_007', schemeName: 'HDFC Corporate Bond Direct Growth', fundHouse: 'HDFC Mutual Fund', category: 'DEBT', riskLevel: 'MODERATE', nav: 28.45, return1y: 8.2, return3y: 7.4, return5y: 7.8, aum: 28900, expenseRatio: 0.30, minSipAmount: 500 },
    { id: 'fund_006', schemeName: 'Axis Liquid Fund Direct Growth', fundHouse: 'Axis Mutual Fund', category: 'LIQUID', riskLevel: 'LOW', nav: 2456.78, return1y: 6.8, return3y: 5.9, return5y: 5.5, aum: 45600, expenseRatio: 0.15, minSipAmount: 500 },
];

const riskColors: Record<string, string> = {
    LOW: 'badge-green', MODERATE: 'badge-amber', HIGH: 'badge-red', VERY_HIGH: 'badge-purple',
};

export default function FundsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [risk, setRisk] = useState('All');
    const [sortBy, setSortBy] = useState('return1y');

    let filtered = [...mockFunds];
    if (search) filtered = filtered.filter((f) => f.schemeName.toLowerCase().includes(search.toLowerCase()) || f.fundHouse.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') filtered = filtered.filter((f) => f.category === category);
    if (risk !== 'All') filtered = filtered.filter((f) => f.riskLevel === risk);
    filtered.sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]);

    const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN');

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mutual Funds</h1>
                    <p className="text-gray-400 text-sm mt-1">{filtered.length} funds available</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            id="fund-search"
                            type="text"
                            className="input-field"
                            placeholder="🔍 Search funds by name or fund house..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="input-field md:w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                    </select>
                    <select className="input-field md:w-36" value={risk} onChange={(e) => setRisk(e.target.value)}>
                        {RISK_LEVELS.map((r) => <option key={r} value={r}>{r === 'All' ? 'All Risk' : r.replace('_', ' ')}</option>)}
                    </select>
                    <select className="input-field md:w-32" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="return1y">1Y Return</option>
                        <option value="return3y">3Y Return</option>
                        <option value="return5y">5Y Return</option>
                        <option value="aum">AUM</option>
                        <option value="nav">NAV</option>
                    </select>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${category === c
                                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                                    : 'bg-surface-elevated/50 text-gray-400 border border-white/5 hover:border-white/20'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fund Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((fund) => (
                    <div
                        key={fund.id}
                        id={`fund-card-${fund.id}`}
                        className="glass-card-hover p-5 cursor-pointer"
                        onClick={() => navigate(`/funds/${fund.id}`)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white truncate">{fund.schemeName}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{fund.fundHouse}</p>
                            </div>
                            <span className={`${riskColors[fund.riskLevel]} ml-2 flex-shrink-0`}>
                                {fund.riskLevel.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <div>
                                <p className="text-xs text-gray-500">1Y Return</p>
                                <p className="text-sm font-semibold text-gain">+{fund.return1y}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">3Y Return</p>
                                <p className="text-sm font-semibold text-gain">+{fund.return3y}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">5Y Return</p>
                                <p className="text-sm font-semibold text-gain">+{fund.return5y}%</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">NAV: <span className="text-gray-300">{formatCurrency(fund.nav)}</span></span>
                                <span className="text-xs text-gray-500">ER: {fund.expenseRatio}%</span>
                            </div>
                            <span className="text-xs text-gray-500">AUM: ₹{(fund.aum / 1000).toFixed(0)}k Cr</span>
                        </div>

                        <button className="btn-primary w-full mt-4 text-sm py-2">
                            Invest Now →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
