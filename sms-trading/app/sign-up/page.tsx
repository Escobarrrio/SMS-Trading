'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/supabase-auth';
import {
  generatePassword,
  calculatePasswordStrength,
  copyToClipboard,
  saveGeneratedPassword,
} from '@/lib/password-generator';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import {
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Calculate password strength in real-time
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleGeneratePassword = useCallback(() => {
    try {
      const generated = generatePassword({
        length: 16,
        useUppercase: true,
        useLowercase: true,
        useNumbers: true,
        useSymbols: true,
        excludeAmbiguous: true,
      });

      setPassword(generated.password);
      setConfirmPassword(generated.password);
      setPasswordStrength(generated.strength);
      saveGeneratedPassword(generated);
    } catch (err) {
      setError('Failed to generate password');
    }
  }, []);

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(password);
    if (success) {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (passwordStrength?.level === 'weak') {
      setError('Password is too weak. Please use a stronger password');
      setLoading(false);
      return;
    }

    const result = await signUp(email, password);
    if (!result.success) {
      setError(result.message || 'Sign up failed');
      setLoading(false);
    } else {
      setSuccess('Sign up successful! Please check your email to confirm.');
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-8 text-center">
            <div className="mb-2">
              <Zap className="w-8 h-8 text-white mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SMS Trading</h1>
            <p className="text-blue-100 text-sm">Enterprise-grade SMS platform for Africa</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    disabled={loading}
                  >
                    <RefreshCw width={12} height={12} />
                    Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff width={18} height={18} />
                    ) : (
                      <Eye width={18} height={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Generator Panel */}
              {showPasswordGenerator && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-blue-900">Generate Strong Password</h4>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCw width={16} height={16} />
                    Generate New Password
                  </button>
                  {password && (
                    <div className="flex items-center gap-2 bg-white rounded border border-gray-200 p-2">
                      <code className="text-xs font-mono text-gray-700 flex-1 truncate">{
                        showPassword ? password : password.replace(/./g, '*')
                      }</code>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700 transition"
                      >
                        <Copy width={16} height={16} />
                      </button>
                      {copiedPassword && (
                        <span className="text-xs text-green-600 font-medium">Copied</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Password Strength Indicator */}
              {password && <PasswordStrengthIndicator strength={passwordStrength} showDetails />}

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff width={18} height={18} />
                    ) : (
                      <Eye width={18} height={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Match Indicator */}
              {password && confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle width={16} height={16} className="text-green-500" />
                      <span className="text-green-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle width={16} height={16} className="text-red-500" />
                      <span className="text-red-700">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  <>Sign Up<CheckCircle width={16} height={16} /></>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <a href="/sign-in" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
