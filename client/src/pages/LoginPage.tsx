import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [mobile, setMobile] = useState('+91');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [devOtp, setDevOtp] = useState('');

    const handleSendOtp = async () => {
        if (mobile.length !== 13) return;
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile }),
            });
            const data = await res.json();
            if (data.success) {
                setDevOtp(data.data.otp || '');
                setStep('otp');
            }
        } catch { } finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                window.location.href = '/';
            }
        } catch { } finally { setLoading(false); }
    };

    // Quick login as demo user
    const handleDemoLogin = () => {
        localStorage.setItem('accessToken', 'demo-token-for-ui-preview');
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[100px]" />

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-glow">
                        I
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">InvestWise</h1>
                    <p className="text-gray-400">India's smartest investment platform</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">
                        {step === 'phone' ? 'Welcome back' : 'Enter OTP'}
                    </h2>

                    {step === 'phone' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Mobile Number</label>
                                <input
                                    id="mobile-input"
                                    type="tel"
                                    className="input-field text-lg tracking-wider"
                                    placeholder="+91 98765 43210"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    maxLength={13}
                                />
                            </div>
                            <button
                                id="send-otp-btn"
                                className="btn-primary w-full text-lg"
                                onClick={handleSendOtp}
                                disabled={loading || mobile.length !== 13}
                            >
                                {loading ? 'Sending...' : 'Get OTP'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                OTP sent to <span className="text-brand-400">{mobile}</span>
                            </p>
                            {devOtp && (
                                <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-400 mb-1">Dev Mode — OTP</p>
                                    <p className="text-2xl font-mono font-bold text-brand-400 tracking-[0.3em]">{devOtp}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">One-Time Password</label>
                                <input
                                    id="otp-input"
                                    type="text"
                                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                                    placeholder="••••••"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                />
                            </div>
                            <button
                                id="verify-otp-btn"
                                className="btn-primary w-full text-lg"
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                            <button className="text-sm text-gray-500 hover:text-brand-400 w-full text-center" onClick={() => setStep('phone')}>
                                ← Change number
                            </button>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <button id="demo-login-btn" className="btn-secondary w-full" onClick={handleDemoLogin}>
                            🚀 Quick Demo Login
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 space-y-2">
                    <p className="text-xs text-gray-600">SEBI Registered Investment Advisor • INZ000012345</p>
                    <p className="text-xs text-gray-600">By continuing, you agree to our Terms & Privacy Policy</p>
                </div>
            </div>
        </div>
    );
}
