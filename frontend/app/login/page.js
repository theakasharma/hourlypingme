'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();

  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user]);

  // Surface Google OAuth errors from callback
  useEffect(() => {
    if (searchParams.get('error') === 'google_failed') {
      setError('Google sign-in failed. Please try again or use email & password.');
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userData;
      if (mode === 'login') {
        userData = await loginWithEmail(email, password);
      } else {
        if (!name.trim()) { setError('Name is required.'); setLoading(false); return; }
        userData = await registerWithEmail(name.trim(), email, password);
      }
      login(null, userData); // token already saved by helper
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0d1a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-[-120px] left-[-100px] w-[420px] h-[420px] rounded-full bg-indigo-600/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-60px] w-[360px] h-[360px] rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30 mb-4">
            📞
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CallDesk CRM</h1>
          <p className="text-slate-400 text-sm mt-1">Smart call reminder management</p>
        </div>

        {/* Card */}
        <div className="bg-[#0f1117] border border-[#1e2132] rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Tabs */}
          <div className="flex bg-[#1a1d2e] rounded-xl p-1 mb-7">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Google Button */}
          <button
            id="google-signin-btn"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] mb-5"
          >
            {/* Google G logo SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            {mode === 'login' ? 'Log in with Gmail' : 'Sign in with Gmail'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#1e2132]" />
            <span className="text-slate-600 text-xs font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-[#1e2132]" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input pr-11"
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Logging in…' : 'Creating account…'}
                </>
              ) : mode === 'login' ? (
                'Log In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 CallDesk CRM · All rights reserved
        </p>
      </div>
    </div>
  );
}
