'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import ReminderTable from '@/components/ReminderTable';
import Link from 'next/link';

const FILTERS = ['All', 'Pending', 'Completed', 'Missed'];

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/reminder/list');
      setReminders(data.data || []);
    } catch {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  useEffect(() => {
    let result = reminders;
    if (activeFilter !== 'All') result = result.filter((r) => r.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.phone.includes(q)
      );
    }
    setFiltered(result);
  }, [reminders, activeFilter, search]);

  const counts = {
    All:       reminders.length,
    Pending:   reminders.filter((r) => r.status === 'Pending').length,
    Completed: reminders.filter((r) => r.status === 'Completed').length,
    Missed:    reminders.filter((r) => r.status === 'Missed').length,
  };

  const filterBadgeColor = {
    All:       'bg-slate-500/15 text-slate-400 border-slate-500/30',
    Pending:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Completed: 'bg-green-500/15 text-green-400 border-green-500/30',
    Missed:    'bg-red-500/15 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeFilter === f
                  ? filterBadgeColor[f] + ' scale-105 shadow-sm'
                  : 'bg-transparent text-slate-500 border-[#2d3148] hover:text-slate-300'
              }`}
            >
              {f}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === f ? '' : 'bg-[#2d3148] text-slate-400'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-52 text-xs py-2"
          />
          <Link href="/add-reminder" className="btn-primary py-2 text-xs whitespace-nowrap">
            ➕ Add
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#1e2132] border border-[#2d3148] rounded-2xl p-5">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-12 bg-[#0b0d1a] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <ReminderTable reminders={filtered} onRefresh={fetchReminders} />
        )}
      </div>

      {/* Total count */}
      <p className="text-xs text-slate-600 text-right">
        Showing {filtered.length} of {reminders.length} reminders
      </p>
    </div>
  );
}
