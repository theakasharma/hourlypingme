'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { playNotificationSound, requestNotificationPermission } from '@/lib/notification';

export default function ReminderPopup() {
  const [popup, setPopup]       = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  // Request notification permission when the popup component mounts
  // (it lives in layout.js so this runs on every page)
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const checkReminders = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/reminder/list?status=Pending');
      const now = new Date();

      // Find reminders that are due within the next 2 minutes and not already dismissed
      const due = data.data?.find((r) => {
        const t    = new Date(r.reminderTime);
        const diff = (t - now) / 1000 / 60; // minutes
        return diff <= 0 && diff >= -2 && !dismissed.has(r._id);
      });

      if (due) setPopup(due);
    } catch {
      // Silently ignore network errors
    }
  }, [dismissed]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [checkReminders]);

  // Play notification sound whenever a new popup appears
  useEffect(() => {
    if (popup) {
      playNotificationSound();
    }
  }, [popup]);

  const dismiss = () => {
    if (popup) setDismissed((prev) => new Set(prev).add(popup._id));
    setPopup(null);
  };

  const snooze = () => {
    // Dismiss for now; the reminder will re-appear on next 30s poll if still in window
    if (popup) setDismissed((prev) => new Set(prev).add(popup._id));
    setPopup(null);
    // Re-enable after 5 minutes so we actually snooze
    setTimeout(() => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.delete(popup?._id);
        return next;
      });
    }, 5 * 60 * 1000);
  };

  const markComplete = async () => {
    if (!popup) return;
    try {
      await axios.post(`/api/reminder/complete/${popup._id}`);
    } catch {}
    dismiss();
  };

  if (!popup) return null;

  const telLink = `tel:${popup.phone?.replace(/\s+/g, '')}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-up max-w-sm w-full">
      <div className="bg-[#1e2132] border border-indigo-500/40 rounded-2xl shadow-2xl shadow-indigo-500/20 p-5 relative overflow-hidden">

        {/* Animated glow ring */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent pointer-events-none rounded-2xl" />
        <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-80 rounded-t-2xl animate-pulse" />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="text-2xl">📞</span>
              {/* Pulsing red dot */}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Call Reminder</p>
              <p className="text-[10px] text-slate-500">Time to make a call!</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-slate-500 hover:text-white transition-colors text-sm leading-none p-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">👤</span>
            <span className="text-white font-bold text-sm">{popup.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">📱</span>
            <span className="text-slate-300 font-mono text-sm">{popup.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🕐</span>
            <span className="text-slate-400 text-xs">
              {format(new Date(popup.reminderTime), 'hh:mm a, dd MMM yyyy')}
            </span>
          </div>
          {popup.notes && (
            <div className="bg-[#0b0d1a] rounded-xl px-3 py-2 mt-2">
              <p className="text-xs text-slate-400 italic">&ldquo;{popup.notes}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Call Now — primary CTA */}
          <a
            href={telLink}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <span className="text-base">📞</span> Call Now
          </a>

          {/* Secondary row: Mark Done + Snooze */}
          <div className="flex gap-2">
            <button
              onClick={markComplete}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
            >
              ✓ Mark Done
            </button>
            <button
              onClick={snooze}
              className="flex-1 bg-[#2d3148] hover:bg-[#3d4158] text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition-all"
            >
              ⏱ Snooze 5 min
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
