import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff,
  AlertCircle, Loader2, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GlobalBackground from '../components/GlobalBackground';

// ── Password strength helper ─────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const map = [
    { label: '',        color: 'bg-white/10'   },
    { label: 'Weak',    color: 'bg-red-500'    },
    { label: 'Fair',    color: 'bg-amber-500'  },
    { label: 'Good',    color: 'bg-sky-500'    },
    { label: 'Strong',  color: 'bg-emerald-500'},
  ];
  return { score, ...map[score] };
}

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();


  const [displayName, setDisplayName]         = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [googleLoading, setGoogleLoading]     = useState(false);

  const strength = getStrength(password);



  // ── Email sign-up ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim()) return setError('Please enter your full name.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (strength.score < 2) return setError('Please choose a stronger password.');

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, displayName.trim());
      navigate('/');
    } catch (err: unknown) {
      console.error('Sign-up error:', err);
      setError('Unable to create account. Please verify your details or try signing in.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-up (defaults to student) ──────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <GlobalBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-transparent to-[#030712]/80 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(14,165,233,0.07)]">

          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-16 mb-4 relative"
            >
              <img
                src="/E-Cell_Logo.png"
                alt="E-Cell"
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(14,165,233,0.6)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement | null)!.style.display = 'flex';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-full h-full rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg"
              >
                E-C
              </div>
            </motion.div>

            <h1 className="text-2xl font-black text-white font-poppins tracking-wide">Join E-Cell</h1>
            <p className="text-white/40 text-sm mt-1">Create your account and start the journey</p>
          </div>



          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl mb-5"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display name */}
            <div className="auth-field-wrap">
              <User size={16} className="auth-field-icon" />
              <input
                id="signup-name"
                type="text"
                placeholder="Full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="auth-input pl-10"
              />
            </div>

            {/* Email */}
            <div className="auth-field-wrap">
              <Mail size={16} className="auth-field-icon" />
              <input
                id="signup-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input pl-10"
              />
            </div>

            {/* Password */}
            <div>
              <div className="auth-field-wrap">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-sky-400 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-white/40">
                      Strength: <span className="text-white/70">{strength.label}</span>
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div className="auth-field-wrap">
              <Lock size={16} className="auth-field-icon" />
              <input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-sky-400 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {passwordsMatch && (
                <CheckCircle2 size={16} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-400" />
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="auth-btn-primary w-full mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Creating account…</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-white/25 text-xs tracking-wider">OR</span>
            <span className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Google (always student) */}
          <button
            id="signup-google"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="auth-btn-google w-full"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
            <span className="text-white/30 text-xs ml-1">(Student)</span>
          </button>

          {/* Login link */}
          <p className="text-center text-white/35 text-sm mt-7">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
