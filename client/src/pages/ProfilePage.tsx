import { useState } from 'react';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'bank' | 'security'>('profile');

    const user = {
        fullName: 'Arjun Sharma',
        mobile: '+91 98765 43210',
        email: 'arjun.sharma@gmail.com',
        dateOfBirth: '15 Jun 1992',
        kycStatus: 'APPROVED',
        pan: 'ABC***34K',
        aadhaar: '****7890',
        joinDate: 'Jan 2025',
    };

    const tabs = [
        { key: 'profile', label: '👤 Profile', icon: '👤' },
        { key: 'kyc', label: '📋 KYC Status', icon: '📋' },
        { key: 'bank', label: '🏦 Bank Accounts', icon: '🏦' },
        { key: 'security', label: '🔒 Security', icon: '🔒' },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl font-bold shadow-glow">
                        AS
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{user.fullName}</h1>
                        <p className="text-gray-400 text-sm">{user.mobile} • {user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="badge-green">KYC Verified ✓</span>
                            <span className="text-xs text-gray-500">Member since {user.joinDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-card/50 rounded-xl p-1 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Full Name', value: user.fullName },
                            { label: 'Mobile', value: user.mobile },
                            { label: 'Email', value: user.email },
                            { label: 'Date of Birth', value: user.dateOfBirth },
                            { label: 'PAN', value: user.pan },
                            { label: 'Aadhaar', value: `**** **** ${user.aadhaar}` },
                        ].map((field) => (
                            <div key={field.label} className="bg-surface-elevated/50 rounded-xl p-4 border border-white/5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{field.label}</p>
                                <p className="text-sm font-medium text-white">{field.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'kyc' && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">KYC Verification Status</h3>
                    <div className="space-y-4">
                        {[
                            { step: 'PAN Verification', status: 'Verified', icon: '✅', desc: 'PAN number verified via NSDL' },
                            { step: 'Aadhaar Verification', status: 'Verified', icon: '✅', desc: 'Verified via DigiLocker' },
                            { step: 'Video KYC', status: 'Approved', icon: '✅', desc: 'Video verification completed' },
                            { step: 'FATCA Declaration', status: 'Submitted', icon: '✅', desc: 'Self-declaration submitted' },
                        ].map((item) => (
                            <div key={item.step} className="flex items-center gap-4 p-4 bg-surface-elevated/30 rounded-xl border border-white/5">
                                <span className="text-2xl">{item.icon}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{item.step}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                </div>
                                <span className="badge-green">{item.status}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                        <p className="text-xs text-gray-400">
                            🔒 Your KYC is valid until <strong className="text-white">Jan 2027</strong>. Re-KYC required every 2 years per SEBI norms.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'bank' && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Linked Bank Accounts</h3>
                    <div className="space-y-3">
                        {[
                            { bank: 'HDFC Bank', account: 'XXXX1234', ifsc: 'HDFC0001234', primary: true },
                            { bank: 'ICICI Bank', account: 'XXXX5678', ifsc: 'ICIC0005678', primary: false },
                        ].map((acc) => (
                            <div key={acc.account} className="flex items-center justify-between p-4 bg-surface-elevated/30 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center text-lg">🏦</div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{acc.bank}</p>
                                        <p className="text-xs text-gray-500">A/c: {acc.account} • IFSC: {acc.ifsc}</p>
                                    </div>
                                </div>
                                {acc.primary && <span className="badge-green">Primary</span>}
                            </div>
                        ))}
                    </div>
                    <button className="btn-secondary w-full mt-4">+ Link New Bank Account</button>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Security & Privacy</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Two-Factor Authentication', desc: 'OTP on every login', enabled: true },
                            { label: 'Biometric Login', desc: 'Fingerprint / Face ID', enabled: false },
                            { label: 'Transaction PIN', desc: 'Required for all orders', enabled: true },
                            { label: 'Login Alerts', desc: 'Email & SMS on new login', enabled: true },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-4 bg-surface-elevated/30 rounded-xl border border-white/5">
                                <div>
                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.enabled ? 'bg-brand-500' : 'bg-gray-600'}`}>
                                    <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${item.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <h4 className="text-sm font-semibold text-white mb-3">Data & Privacy (DPDPA 2023)</h4>
                        <div className="space-y-2">
                            <button className="text-sm text-accent-blue hover:underline block">📥 Download My Data</button>
                            <button className="text-sm text-accent-blue hover:underline block">📋 View Consent Preferences</button>
                            <button className="text-sm text-red-400 hover:underline block">🗑️ Request Account Deletion</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
