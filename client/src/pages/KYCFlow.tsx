// ═══════════════════════════════════════════════════════════════════════════════
// KYC FLOW — Multi-Step KYC Verification Component
// ═══════════════════════════════════════════════════════════════════════════════
//
// REGULATORY:
//   - SEBI mandates full KYC before any investment transaction
//   - PAN is mandatory for all financial activities (SEBI KRA Regulation)
//   - Aadhaar verification via DigiLocker (SEBI-approved channel)
//   - Video KYC per SEBI circular SEBI/HO/MIRSD/DOP/CIR/P/2021/103
//   - Re-KYC required every 2 years
//
// UX DECISIONS:
//   - Progressive disclosure: show one step at a time, no overwhelming forms
//   - Real-time validation: PAN format checked as user types
//   - Clear status badges showing verification progress
//   - Dev mode: auto-fill for quick testing
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

type KycStep = 'pan' | 'aadhaar' | 'video' | 'complete';

interface KycState {
  panNumber: string;
  panVerified: boolean;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  videoSubmitted: boolean;
  kycStatus: string;
}

export default function KYCFlow() {
  const [step, setStep] = useState<KycStep>('pan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycState, setKycState] = useState<KycState>({
    panNumber: '', panVerified: false,
    aadhaarNumber: '', aadhaarVerified: false,
    videoSubmitted: false, kycStatus: 'NOT_STARTED',
  });

  // ── PAN Validation (real-time as user types) ──
  // Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
  // 4th char: P=Person, C=Company, H=HUF
  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(kycState.panNumber);

  const handleVerifyPan = async () => {
    if (!isPanValid) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/kyc/verify-pan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ panNumber: kycState.panNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setKycState(prev => ({ ...prev, panVerified: true, kycStatus: 'PAN_VERIFIED' }));
        setStep('aadhaar');
      } else {
        setError(data.error?.message || 'PAN verification failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAadhaar = async () => {
    if (kycState.aadhaarNumber.length !== 12) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/kyc/verify-aadhaar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ aadhaarNumber: kycState.aadhaarNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setKycState(prev => ({ ...prev, aadhaarVerified: true, kycStatus: 'AADHAAR_VERIFIED' }));
        setStep('video');
      } else {
        setError(data.error?.message || 'Aadhaar verification failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoKyc = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/kyc/video-kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ videoUrl: 'https://s3.example.com/kyc/demo-video.mp4' }),
      });
      const data = await res.json();
      if (data.success) {
        setKycState(prev => ({ ...prev, videoSubmitted: true, kycStatus: 'VIDEO_SUBMITTED' }));
        // In real app: poll for approval. In dev: auto-completes in 3 seconds
        setTimeout(() => {
          setKycState(prev => ({ ...prev, kycStatus: 'APPROVED' }));
          setStep('complete');
        }, 3000);
      } else {
        setError(data.error?.message || 'Video KYC submission failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step Indicator ──
  const steps: { key: KycStep; label: string; icon: string }[] = [
    { key: 'pan', label: 'PAN', icon: '🪪' },
    { key: 'aadhaar', label: 'Aadhaar', icon: '🆔' },
    { key: 'video', label: 'Video KYC', icon: '📹' },
    { key: 'complete', label: 'Done', icon: '✅' },
  ];

  const stepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Complete Your KYC</h1>
        <p className="text-gray-400 text-sm mt-1">
          SEBI requires full KYC verification before you can start investing
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all
                  ${i < stepIndex ? 'bg-accent-green/20 text-accent-green' :
                    i === stepIndex ? 'bg-brand-500/20 text-brand-400 ring-2 ring-brand-500/30' :
                    'bg-surface-elevated text-gray-500'}`}
                >
                  {i < stepIndex ? '✓' : s.icon}
                </div>
                <span className={`text-xs mt-1.5 ${i <= stepIndex ? 'text-white' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 ${
                  i < stepIndex ? 'bg-accent-green' : 'bg-surface-elevated'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-accent-red">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Step Content */}
      <div className="glass-card p-6 animate-slide-up">
        {/* ── Step 1: PAN Verification ── */}
        {step === 'pan' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🪪</span>
              <div>
                <h2 className="text-lg font-semibold text-white">PAN Verification</h2>
                <p className="text-sm text-gray-400">Enter your PAN as printed on your card</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">PAN Number</label>
              <input
                id="pan-input"
                type="text"
                className="input-field text-lg tracking-widest uppercase font-mono"
                placeholder="ABCDE1234F"
                value={kycState.panNumber}
                onChange={(e) => setKycState(prev => ({
                  ...prev,
                  panNumber: e.target.value.toUpperCase().slice(0, 10),
                }))}
                maxLength={10}
              />
              {/* Real-time validation feedback */}
              {kycState.panNumber.length > 0 && (
                <p className={`text-xs mt-2 ${isPanValid ? 'text-accent-green' : 'text-accent-amber'}`}>
                  {isPanValid ? '✅ Valid PAN format' :
                    kycState.panNumber.length < 10 ? `${10 - kycState.panNumber.length} more characters needed` :
                    '❌ Invalid format. Expected: ABCDE1234F'}
                </p>
              )}
            </div>

            {/* PAN Format Helper */}
            <div className="bg-surface-elevated/30 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-gray-400 mb-2">📋 PAN Format Guide:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <span>Characters 1-3: Random letters</span>
                <span>Character 4: P (Person)</span>
                <span>Character 5: First letter of surname</span>
                <span>Characters 6-9: Random numbers</span>
              </div>
            </div>

            <button
              id="verify-pan-btn"
              className="btn-primary w-full"
              onClick={handleVerifyPan}
              disabled={loading || !isPanValid}
            >
              {loading ? '⏳ Verifying with NSDL...' : 'Verify PAN'}
            </button>

            {/* Dev Mode Auto-Fill */}
            <button
              className="btn-secondary w-full text-sm"
              onClick={() => setKycState(prev => ({ ...prev, panNumber: 'ABCPK1234K' }))}
            >
              🧪 Dev: Auto-fill PAN
            </button>
          </div>
        )}

        {/* ── Step 2: Aadhaar Verification ── */}
        {step === 'aadhaar' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🆔</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Aadhaar Verification</h2>
                <p className="text-sm text-gray-400">
                  Verified via DigiLocker (UIDAI-approved, SEBI-mandated channel)
                </p>
              </div>
            </div>

            <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-xl p-4">
              <p className="text-xs text-accent-blue flex items-center gap-2">
                🔒 Your Aadhaar is encrypted (AES-256) before storage. Only last 4 digits are visible.
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Aadhaar Number</label>
              <input
                id="aadhaar-input"
                type="text"
                className="input-field text-lg tracking-widest font-mono"
                placeholder="0000 0000 0000"
                value={kycState.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setKycState(prev => ({ ...prev, aadhaarNumber: digits }));
                }}
                maxLength={14}
              />
              {kycState.aadhaarNumber.length > 0 && kycState.aadhaarNumber.length < 12 && (
                <p className="text-xs mt-2 text-accent-amber">
                  {12 - kycState.aadhaarNumber.length} digits remaining
                </p>
              )}
            </div>

            <button
              id="verify-aadhaar-btn"
              className="btn-primary w-full"
              onClick={handleVerifyAadhaar}
              disabled={loading || kycState.aadhaarNumber.length !== 12}
            >
              {loading ? '⏳ Connecting to DigiLocker...' : 'Verify via DigiLocker'}
            </button>

            <button
              className="btn-secondary w-full text-sm"
              onClick={() => setKycState(prev => ({ ...prev, aadhaarNumber: '123456789012' }))}
            >
              🧪 Dev: Auto-fill Aadhaar
            </button>
          </div>
        )}

        {/* ── Step 3: Video KYC ── */}
        {step === 'video' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📹</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Video KYC</h2>
                <p className="text-sm text-gray-400">
                  Record a short verification video (SEBI requirement)
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-surface-elevated/30 rounded-xl p-5 border border-white/5 space-y-3">
              <p className="text-sm font-medium text-white">📋 Instructions:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                <li>Find a well-lit area with a plain background</li>
                <li>Hold your <strong className="text-white">PAN card</strong> near your face</li>
                <li>Clearly state your <strong className="text-white">full name</strong></li>
                <li>State your <strong className="text-white">PAN number</strong></li>
                <li>State your <strong className="text-white">date of birth</strong></li>
                <li>Video must be at least <strong className="text-white">30 seconds</strong></li>
              </ol>
            </div>

            {/* Video Preview Area */}
            <div className="relative rounded-xl overflow-hidden bg-surface-elevated border border-white/10 aspect-video flex items-center justify-center">
              {kycState.videoSubmitted ? (
                <div className="text-center animate-pulse">
                  <span className="text-4xl block mb-2">📹</span>
                  <p className="text-sm text-accent-amber">Video submitted — under review</p>
                  <p className="text-xs text-gray-500 mt-1">AI + Manual review in progress...</p>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-5xl block mb-3">📹</span>
                  <p className="text-sm text-gray-400">Camera preview area</p>
                  <p className="text-xs text-gray-600 mt-1">
                    In production: WebRTC camera feed with recording
                  </p>
                </div>
              )}
            </div>

            {!kycState.videoSubmitted && (
              <button
                id="submit-video-btn"
                className="btn-primary w-full"
                onClick={handleVideoKyc}
                disabled={loading}
              >
                {loading ? '⏳ Submitting Video...' : '🎬 Submit Video KYC'}
              </button>
            )}

            {kycState.videoSubmitted && (
              <div className="bg-accent-amber/5 border border-accent-amber/10 rounded-xl p-4 text-center">
                <p className="text-sm text-accent-amber">
                  ⏳ Your video is being reviewed. Auto-approving in dev mode...
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Complete ── */}
        {step === 'complete' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center text-4xl mx-auto animate-fade-in">
              🎉
            </div>
            <h2 className="text-xl font-bold text-white">KYC Verified!</h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              Your KYC has been approved. You can now invest in mutual funds,
              SIPs, and other instruments on InvestWise.
            </p>

            <div className="bg-surface-elevated/30 rounded-xl p-4 border border-white/5 text-left space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">PAN</span>
                <span className="text-white font-mono">
                  {kycState.panNumber.slice(0, 3)}***{kycState.panNumber.slice(-1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Aadhaar</span>
                <span className="text-white font-mono">
                  **** {kycState.aadhaarNumber.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Video KYC</span>
                <span className="badge-green text-xs">Approved</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valid Until</span>
                <span className="text-white">
                  {new Date(Date.now() + 2 * 365 * 86400000).toLocaleDateString('en-IN', {
                    month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => window.location.href = '/funds'}
            >
              Start Investing →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
