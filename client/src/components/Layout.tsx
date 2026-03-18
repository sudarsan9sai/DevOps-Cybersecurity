import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/funds', label: 'Mutual Funds', icon: '📈' },
    { path: '/watchlist', label: 'Watchlist', icon: '⭐' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-surface-primary">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface-secondary/95 backdrop-blur-xl
        border-r border-white/5 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xl font-bold">
                        I
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">InvestWise</h1>
                        <p className="text-xs text-gray-500">Smart Investing</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                    <div className="glass-card p-3 mb-3">
                        <p className="text-xs text-gray-400 mb-1">SEBI Registered</p>
                        <p className="text-xs text-brand-400 font-mono">INZ000012345</p>
                    </div>
                    <button onClick={handleLogout} className="w-full nav-link text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-surface-primary/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-surface-hover"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-green/10 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                                <span className="text-xs text-accent-green font-medium">Market Open</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">Arjun Sharma</p>
                                <p className="text-xs text-gray-500">KYC Verified ✓</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold">
                                AS
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
