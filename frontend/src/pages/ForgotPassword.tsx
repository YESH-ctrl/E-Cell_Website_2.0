import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GlobalBackground from '../components/GlobalBackground';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);

      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to send the reset email.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <GlobalBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-transparent to-[#030712]/80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-2xl bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2">
              Reset your password
            </h1>

            <p className="text-white/40 text-sm">
              Enter your email address and we will send you a recovery link.
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <CheckCircle2
                size={42}
                className="text-green-400 mx-auto mb-4"
              />

              <p className="text-white/70 mb-6">
                If an account exists for that email, a password-reset link has
                been sent. Please check your inbox.
              </p>

              <Link
                to="/login"
                className="auth-btn-primary w-full inline-flex items-center justify-center"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="auth-field-wrap">
                <Mail size={16} className="auth-field-icon" />

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input pl-10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-sky-400 hover:text-sky-300"
              >
                <ArrowLeft size={15} />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}