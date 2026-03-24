'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { fetchCurrentUser } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      router.replace('/login?error=google_failed');
      return;
    }

    if (token) {
      setToken(token);
      fetchCurrentUser().then((u) => {
        setUser(u);
        router.replace('/dashboard');
      });
    } else {
      router.replace('/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0d1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}
