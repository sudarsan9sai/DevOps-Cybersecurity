import { useState } from 'react';

const mockWatchlist = [
    { id: 'wl_001', assetType: 'MUTUAL_FUND', assetName: 'ICICI Prudential Technology Direct Growth', assetCode: 'INF109K01Z48', currentPrice: 145.67, change: 2.34, changePercent: 1.63 },
    { id: 'wl_002', assetType: 'MUTUAL_FUND', assetName: 'Kotak Equity Opportunities Direct Growth', assetCode: 'INF173K01FQ4', currentPrice: 267.89, change: 1.56, changePercent: 0.59 },
    { id: 'wl_003', assetType: 'STOCK', assetName: 'Reliance Industries Ltd', assetCode: 'RELIANCE', currentPrice: 2567.80, change: -15.40, changePercent: -0.60 },
    { id: 'wl_004', assetType: 'STOCK', assetName: 'Tata Consultancy Services Ltd', assetCode: 'TCS', currentPrice: 3890.50, change: 32.70, changePercent: 0.85 },
];

const mockAlerts = [
    { id: 'alert_001', assetName: 'ICICI Prudential Technology', targetPrice: 150, condition: 'ABOVE', triggered: false, currentPrice: 145.67 },
    { id: 'alert_002', assetName: 'Reliance Industries', targetPrice: 2400, condition: 'BELOW', triggered: false, currentPrice: 2567.80 },
];

const mockSearch = [
    { type: 'MUTUAL_FUND', name: 'HDFC Flexi Cap Fund Direct Growth', fundHouse: 'HDFC MF', nav: 34.56, return1y: 15.8 },
    { type: 'STOCK', code: 'INFY', name: 'Infosys Ltd', price: 1567.25, change: -0.45 },
    { type: 'MUTUAL_FUND', name: 'SBI Blue Chip Fund Direct Growth', fundHouse: 'SBI MF', nav: 67.89, return1y: 16.2 },
];

export default function WatchlistPage() {
    const [tab, setTab] = useState<'watchlist' | 'discover'>('watchlist');
    const [search, setSearch] = useState('');

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-white">Watchlist & Discovery</h1>

            {/* Tabs */}
            <div className="flex bg-surface-card/50 rounded-xl p-1 w-fit">
                {(['watchlist', 'discover'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {t === 'watchlist' ? '⭐ Watchlist' : '🔍 Discover'}
                    </button>
                ))}
            </div>

            {tab === 'watchlist' ? (
                <div className="space-y-6">
                    {/* Watchlist Items */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-white/5">
                            <h3 className="font-semibold text-white">Your Watchlist ({mockWatchlist.length})</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {mockWatchlist.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-surface-hover/50 transition-colors cursor-pointer">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.assetType === 'MUTUAL_FUND' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-purple/10 text-accent-purple'}`}>
                                                {item.assetType === 'MUTUAL_FUND' ? 'MF' : 'Stock'}
                                            </span>
                                            <h4 className="text-sm font-medium text-white">{item.assetName}</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{item.assetCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-white">₹{item.currentPrice.toLocaleString()}</p>
                                        <p className={`text-xs ${item.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                                            {item.change >= 0 ? '▲' : '▼'} ₹{Math.abs(item.change)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent}%)
                                        </p>
                                    </div>
                                    <button className="ml-4 text-gray-500 hover:text-red-400 text-lg">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Alerts */}
                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-white mb-4">🔔 Price Alerts</h3>
                        <div className="space-y-3">
                            {mockAlerts.map((alert) => {
                                const progress = alert.condition === 'ABOVE'
                                    ? (alert.currentPrice / alert.targetPrice) * 100
                                    : (alert.targetPrice / alert.currentPrice) * 100;
                                return (
                                    <div key={alert.id} className="bg-surface-elevated/50 rounded-xl p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-sm font-medium text-white">{alert.assetName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Alert when price goes {alert.condition.toLowerCase()} ₹{alert.targetPrice}
                                                </p>
                                            </div>
                                            <span className="badge-amber">Watching</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-surface-primary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-accent-amber to-brand-500 rounded-full transition-all"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">{progress.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Search */}
                    <div className="glass-card p-5">
                        <input
                            type="text"
                            className="input-field text-lg"
                            placeholder="🔍 Search stocks, mutual funds, ETFs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Trending */}
                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-white mb-4">🔥 Trending Today</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {mockSearch.map((item, i) => (
                                <div key={i} className="bg-surface-elevated/50 rounded-xl p-4 border border-white/5 hover:border-brand-500/20 transition-colors cursor-pointer">
                                    <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'MUTUAL_FUND' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-purple/10 text-accent-purple'}`}>
                                        {item.type === 'MUTUAL_FUND' ? 'Mutual Fund' : 'Stock'}
                                    </span>
                                    <p className="text-sm font-medium text-white mt-2">{item.name}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500">
                                            {item.type === 'MUTUAL_FUND' ? (item as any).fundHouse : (item as any).code}
                                        </span>
                                        <span className="text-sm font-semibold text-brand-400">
                                            ₹{(item.type === 'MUTUAL_FUND' ? (item as any).nav : (item as any).price)}
                                        </span>
                                    </div>
                                    <button className="w-full mt-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20">
                                        + Add to Watchlist
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
