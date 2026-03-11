'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard',    icon: '📊' },
  { href: '/add-reminder', label: 'Add Reminder', icon: '➕' },
  { href: '/reminders',   label: 'All Reminders', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[260px] bg-[#0f1117] border-r border-[#1e2132] flex flex-col z-50"
    >
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1e2132]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-sm">
            👤
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Calling Team</p>
            <p className="text-[10px] text-slate-500">Active</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
