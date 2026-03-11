'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { format } from 'date-fns';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`stat-card flex items-center gap-4 group`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/reminder/list');
      setReminders(data.data || []);
      setStats(data.stats || null);
    } catch {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const todayReminders = reminders.filter((r) => {
    const t = new Date(r.reminderTime);
    const today = new Date();
    return t.toDateString() === today.toDateString();
  });

  const upcoming = reminders.filter((r) => r.status === 'Pending' && new Date(r.reminderTime) > new Date());
  const missed = reminders.filter((r) => r.status === 'Missed');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="📞" label="Total Calls Today" value={stats?.totalToday ?? 0}        color="bg-indigo-600/20" />
        <StatCard icon="⏳" label="Pending"           value={stats?.pendingToday ?? 0}      color="bg-amber-500/20" />
        <StatCard icon="✅" label="Completed Today"   value={stats?.completedToday ?? 0}    color="bg-green-600/20" />
        <StatCard icon="❌" label="Missed Today"      value={stats?.missedToday ?? 0}       color="bg-red-600/20" />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Reminders */}
        <div className="xl:col-span-2 bg-[#1e2132] border border-[#2d3148] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📅</span> Today&apos;s Reminders
              <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold ml-1">
                {todayReminders.length}
              </span>
            </h3>
            <Link href="/reminders" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-14 bg-[#0b0d1a] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : todayReminders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-slate-400 text-sm">No reminders for today!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayReminders.slice(0, 6).map((r) => {
                const statusClasses = {
                  Pending:   'border-l-amber-500',
                  Completed: 'border-l-green-500',
                  Missed:    'border-l-red-500',
                };
                return (
                  <div
                    key={r._id}
                    className={`flex items-center justify-between bg-[#0b0d1a] border-l-2 ${statusClasses[r.status]} rounded-xl px-4 py-3 hover:bg-[#151826] transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{r.name}</p>
                        <p className="text-[11px] text-slate-500">{r.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{format(new Date(r.reminderTime), 'hh:mm a')}</p>
                      <p className="text-[10px] text-slate-500">{r.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming */}
          <div className="bg-[#1e2132] border border-[#2d3148] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <span>🔮</span> Upcoming
              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold ml-1">{upcoming.length}</span>
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-3">No upcoming reminders</p>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 3).map((r) => (
                  <div key={r._id} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-white font-medium truncate flex-1">{r.name}</span>
                    <span className="text-slate-500 shrink-0">{format(new Date(r.reminderTime), 'dd MMM hh:mm a')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missed */}
          <div className="bg-[#1e2132] border border-[#2d3148] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <span>⚠️</span> Missed
              <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold ml-1">{missed.length}</span>
            </h3>
            {missed.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-3">No missed reminders</p>
            ) : (
              <div className="space-y-2">
                {missed.slice(0, 3).map((r) => (
                  <div key={r._id} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span className="text-white font-medium truncate flex-1">{r.name}</span>
                    <span className="text-slate-500 shrink-0">{format(new Date(r.reminderTime), 'dd MMM')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add */}
          <Link
            href="/add-reminder"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            ➕ New Reminder
          </Link>
        </div>
      </div>
    </div>
  );
}
