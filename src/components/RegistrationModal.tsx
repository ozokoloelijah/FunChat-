import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  MapPin, 
  Globe2, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  Sparkles, 
  Clock, 
  AlertCircle,
  Copy,
  ChevronDown,
  X
} from 'lucide-react';
import { COUNTRIES, CountryInfo, getCountryByCode } from '../utils/locations';
import { generateUserKeys } from '../utils/crypto';
import { playOtpChime } from '../utils/sound';
import { User } from '../types/chat';

interface RegistrationModalProps {
  isOpen: boolean;
  onComplete: (user: User) => void;
  onClose?: () => void;
  isFullScreen?: boolean;
  onUseDemoUser?: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen, 
  onComplete, 
  onClose,
  isFullScreen = false,
  onUseDemoUser
}) => {
  // Step state: 1: Phone, 2: 2FA OTP, 3: Origin Location, 4: Residence & Timezone, 5: Profile & E2EE Keys
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Step 1: Phone details
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('NG');
  const [phoneDigits, setPhoneDigits] = useState<string>('8012345678');
  
  // Step 2: 2FA details
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [simulatedIncomingSms, setSimulatedIncomingSms] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [enablePin2FA, setEnablePin2FA] = useState<boolean>(true);
  const [securityPin, setSecurityPin] = useState<string>('2468');
  const [webSmsLog, setWebSmsLog] = useState<any>(null);

  // Step 3: Origin location
  const [originCountryCode, setOriginCountryCode] = useState<string>('NG');
  const [originState, setOriginState] = useState<string>('Lagos');
  const [originCity, setOriginCity] = useState<string>('Lekki');

  // Step 4: Current Residence
  const [currentCountryCode, setCurrentCountryCode] = useState<string>('GB');

  // Step 5: Profile & E2EE keys
  const [displayName, setDisplayName] = useState<string>('Alex Morgan');
  const [username, setUsername] = useState<string>('alex_vibe');
  const [bio, setBio] = useState<string>('Building fast apps ⚡ Diaspora Gen-Z');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  const [keyGenProgress, setKeyGenProgress] = useState<boolean>(false);

  // Available avatars
  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  ];

  // Helper countries
  const phoneCountry = getCountryByCode(selectedCountryCode) || COUNTRIES[0];
  const originCountry = getCountryByCode(originCountryCode) || COUNTRIES[0];
  const currentCountry = getCountryByCode(currentCountryCode) || COUNTRIES[1];

  // Update states and cities when origin country changes
  useEffect(() => {
    if (originCountry && originCountry.states.length > 0) {
      setOriginState(originCountry.states[0].name);
      if (originCountry.states[0].cities.length > 0) {
        setOriginCity(originCountry.states[0].cities[0]);
      }
    }
  }, [originCountryCode]);

  // Update cities when state changes
  useEffect(() => {
    const st = originCountry.states.find((s) => s.name === originState);
    if (st && st.cities.length > 0) {
      setOriginCity(st.cities[0]);
    }
  }, [originState]);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phoneDigits || phoneDigits.length < 6) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    const fullPhone = `${phoneCountry.dialCode}${phoneDigits.replace(/\s+/g, '')}`;

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSimulatedIncomingSms(data.simulatedOtp);
        setWebSmsLog(data.webSmsGateway);
        playOtpChime();
        setStep(2);
        setCountdown(60);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch verification code');
      }
    } catch {
      // Offline fallback
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedIncomingSms(fallbackOtp);
      setWebSmsLog({
        serverUrl: 'https://textbelt.com/text',
        latencyMs: 195,
        deliveredDirectly: false,
      });
      playOtpChime();
      setLoading(false);
      setStep(2);
      setCountdown(60);
    }
  };

  // Step 2: Handle OTP auto-fill & verification
  const handleAutoFillOtp = (code: string) => {
    const digits = code.split('').slice(0, 6);
    setOtpCode(digits);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your 2FA OTP code');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const fullPhone = `${phoneCountry.dialCode}${phoneDigits.replace(/\s+/g, '')}`;

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone, code }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success || code === simulatedIncomingSms || code === '123456') {
        setStep(3); // Go to origin location step
      } else {
        setErrorMsg('Invalid or expired 2FA code. Please check SMS or try 123456.');
      }
    } catch {
      setLoading(false);
      setStep(3);
    }
  };

  // Step 5: Finalize profile & E2EE keys
  const handleFinishRegistration = () => {
    setKeyGenProgress(true);

    setTimeout(() => {
      const fullPhone = `${phoneCountry.dialCode} ${phoneDigits}`;
      const keys = generateUserKeys(username || 'alex');

      const newUser: User = {
        id: `user_${Date.now()}`,
        phoneNumber: fullPhone,
        name: displayName.trim() || 'Alex Morgan',
        username: username.trim().toLowerCase() || 'alex_vibe',
        avatar: selectedAvatar,
        bio: bio.trim(),
        originCountry: originCountry.name,
        originState: originState,
        originCity: originCity,
        currentCountry: currentCountry.name,
        timezone: currentCountry.timezone,
        utcOffset: currentCountry.utcOffset,
        twoFactorEnabled: true,
        e2eePublicKey: keys.publicKey,
        e2eeFingerprint: keys.fingerprint,
        isOnline: true,
      };

      setKeyGenProgress(false);
      onComplete(newUser);
    }, 1200);
  };

  return (
    <div className={isFullScreen ? "w-full max-w-lg mx-auto py-2" : "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"}>
      {/* Simulated 2FA SMS Push Alert Banner */}
      {simulatedIncomingSms && step === 2 && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 w-full max-w-md px-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Messages</span>
                  <span className="text-[10px] text-slate-400">• Just now</span>
                </div>
                <p className="text-sm font-medium text-slate-200">
                  FunChat 2FA Code: <span className="text-emerald-300 font-mono font-bold tracking-widest">{simulatedIncomingSms}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAutoFillOtp(simulatedIncomingSms)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Auto-fill
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Header with Step Tracker */}
        <div className="p-6 pb-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                ⚡
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  FunChat <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">E2EE Verified</span>
                </h2>
                <p className="text-xs text-slate-400">Next-gen global messaging & communities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                Step {step} / 5
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s < step
                    ? 'bg-emerald-500'
                    : s === step
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone Registration */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Enter Your Phone Number</h3>
                <p className="text-xs text-slate-400 mt-1">
                  We verify all users via secure 2-Factor Authentication (2FA) to maintain spam-free community groups.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Country Dial Code</label>
                  <div className="relative">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-sm text-slate-100 appearance-none focus:outline-none focus:border-emerald-500 transition cursor-pointer pr-10"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-800 focus-within:border-emerald-500 transition bg-slate-950">
                    <div className="px-3.5 py-3 bg-slate-800/60 text-slate-300 text-sm font-mono flex items-center border-r border-slate-800">
                      {phoneCountry.flag} {phoneCountry.dialCode}
                    </div>
                    <input
                      type="tel"
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="801 234 5678"
                      className="w-full bg-transparent py-3 px-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Preview: {phoneCountry.dialCode} {phoneDigits || '...'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {loading ? 'Dispatching 2FA Code...' : 'Send 2FA Verification Code'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {onUseDemoUser && (
                  <div className="pt-1 text-center">
                    <div className="flex items-center my-3">
                      <div className="flex-1 border-t border-slate-800"></div>
                      <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">Instant Preview</span>
                      <div className="flex-1 border-t border-slate-800"></div>
                    </div>
                    <button
                      type="button"
                      onClick={onUseDemoUser}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition cursor-pointer hover:underline"
                    >
                      ⚡ Skip registration & explore with demo account (Alex Morgan)
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* STEP 2: 2FA OTP & Security PIN */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the 6-digit code sent to <span className="text-emerald-400 font-mono">{phoneCountry.dialCode} {phoneDigits}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <div className="flex justify-between gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={otpCode[index]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          const newCode = [...otpCode];
                          newCode[index] = val;
                          setOtpCode(newCode);
                          if (val && index < 5) {
                            const next = document.getElementById(`otp-${index + 1}`);
                            next?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                            const prev = document.getElementById(`otp-${index - 1}`);
                            prev?.focus();
                          }
                        }}
                        className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-mono font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Expires in: <span className="font-mono text-emerald-400 font-bold">{countdown}s</span>
                    </span>
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={() => {
                        setCountdown(60);
                        const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
                        setSimulatedIncomingSms(fallbackOtp);
                        playOtpChime();
                      }}
                      className="text-emerald-400 hover:underline disabled:opacity-40 disabled:no-underline font-medium cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                {/* Secondary 2FA PIN toggle */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Secondary Account PIN (2FA)</div>
                        <div className="text-[11px] text-slate-400">Protects your account during device transfer</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enablePin2FA}
                      onChange={(e) => setEnablePin2FA(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  {enablePin2FA && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                      <label className="text-xs text-slate-300">Set 4-digit master PIN:</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-center font-mono text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Change Phone
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? 'Verifying 2FA...' : 'Verify 2FA & Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Origin Location (Community Roots) */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Your Hometown / Origin</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect with people from your homeland wherever you are in the world.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Country of Origin</label>
                  <select
                    value={originCountryCode}
                    onChange={(e) => setOriginCountryCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">State / Province</label>
                    <select
                      value={originState}
                      onChange={(e) => setOriginState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      {originCountry.states.map((st) => (
                        <option key={st.name} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">City</label>
                    <select
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      {(originCountry.states.find((s) => s.name === originState)?.cities || [originCity]).map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Diaspora community preview banner */}
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-300">Unlocked Community: </span>
                    <span className="text-slate-200">
                      {originCity}, {originCountry.name} {originCountry.flag} Global Diaspora Hub
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Continue to Current Residence
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Current Residence & Regional Data */}
          {step === 4 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Where Do You Live Now?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enables accurate time zone indicators, local expat meetups, and regional servers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Country Currently Living In</label>
                  <select
                    value={currentCountryCode}
                    onChange={(e) => setCurrentCountryCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Regional configuration summary card */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Auto-Configured Regional Settings
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Primary Time Zone:</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {currentCountry.timezone} ({currentCountry.utcOffset})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Regional Currency:</span>
                    <span className="text-slate-200 font-medium">{currentCountry.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Expat Group:</span>
                    <span className="text-teal-300 font-medium">
                      {originCountry.name} to {currentCountry.name} Collective
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-1/3 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="w-2/3 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Continue to Profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Profile Customization & E2EE Key Generation */}
          {step === 5 && (
            <div>
              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Your FunChat Profile</h3>
                <p className="text-xs text-slate-400">
                  Pick your avatar and create your zero-knowledge cryptographic keys.
                </p>
              </div>

              <div className="space-y-4">
                {/* Avatar Picker */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Choose Avatar</label>
                  <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
                    {AVATAR_OPTIONS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                          selectedAvatar === url
                            ? 'border-emerald-400 ring-4 ring-emerald-500/20 scale-105'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Username Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        placeholder="alex_vibe"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-7 pr-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Encrypted Status</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Building fast apps ⚡"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* E2EE Key summary */}
                <div className="p-3 bg-slate-950/90 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cryptographic E2EE Engine Active</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Curve25519 ECDH keypair and WhatsApp-compatible 60-digit safety numbers will be initialized locally in your browser.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={keyGenProgress}
                  onClick={handleFinishRegistration}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {keyGenProgress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Generating E2EE Keypair...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Enter FunChat
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
