'use client';

import { usePathname } from 'next/navigation';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your call reminders' },
  '/add-reminder': { title: 'Add Reminder', subtitle: 'Schedule a new call reminder' },
  '/reminders': { title: 'All Reminders', subtitle: 'Manage and track all reminders' },
};

export default function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: 'CallDesk CRM', subtitle: '' };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-40 bg-[#0b0d1a]/80 backdrop-blur-md border-b border-[#1e2132] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{page.title}</h2>
          <p className="text-xs text-slate-500">{page.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-medium text-white">{timeStr}</p>
            <p className="text-[10px] text-slate-500">{dateStr}</p>
          </div>
          <div className="w-px h-8 bg-[#2d3148]" />
          <div className="flex items-center gap-2 bg-[#1e2132] border border-[#2d3148] rounded-xl px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
