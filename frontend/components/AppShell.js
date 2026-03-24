'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ReminderPopup from '@/components/ReminderPopup';

// Routes that don't require authentication and don't show the app shell
const PUBLIC_ROUTES = ['/login', '/auth/callback'];

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (loading) return;
    if (!isPublic && !user) {
      // Not logged in & trying to access protected route → go to login
      router.replace('/login');
    } else if (isPublic && user) {
      // Already logged in & on login page → go to dashboard
      router.replace('/dashboard');
    }
  }, [user, loading, pathname]);

  // While checking auth, show a minimal loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Public routes (login, oauth callback) — no sidebar/header
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected app layout
  if (!user) return null; // prevent flash before redirect

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px]">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
      <ReminderPopup />
    </div>
  );
}
