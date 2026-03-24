'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',    icon: '📊' },
  { href: '/add-reminder', label: 'Add Reminder', icon: '➕' },
  { href: '/reminders',    label: 'All Reminders', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    router.replace('/login');
  }

  // Initials avatar fallback
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="fixed top-0 left-0 h-full w-[260px] bg-[#0f1117] border-r border-[#1e2132] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#1e2132]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30">
            📞
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">CallDesk</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">CRM System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 px-4 mb-3 font-semibold">
          Main Menu
        </p>
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`nav-link ${isActive ? 'active' : ''}`}>
              <span className="text-base">{icon}</span>
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4 border-t border-[#1e2132]">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
        </div>

        {/* Logout button */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-[#1a1d2e] hover:bg-red-500/10 border border-[#2d3148] hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-medium py-2 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
