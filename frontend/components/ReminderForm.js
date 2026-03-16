'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, addMinutes, addDays } from 'date-fns';
import { scheduleReminderNotifications } from '@/lib/reminderScheduler';
import { requestNotificationPermission } from '@/lib/notification';

export default function ReminderForm({ initial = null, onSuccess }) {
  const router = useRouter();
  const isEdit = !!initial;

  const [form, setForm] = useState({
    name:         initial?.name || '',
    phone:        initial?.phone || '',
    notes:        initial?.notes || '',
    reminderTime: initial?.reminderTime
      ? format(new Date(initial.reminderTime), "yyyy-MM-dd'T'HH:mm")
      : '',
  });
  const [loading, setLoading] = useState(false);

  // Request notification permission as soon as the form mounts.
  // This ensures the browser prompt appears proactively rather than
  // at the exact moment an alert fires for the first time.
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const setQuickTime = (minutes) => {
    const t = addMinutes(new Date(), minutes);
    setForm((f) => ({ ...f, reminderTime: format(t, "yyyy-MM-dd'T'HH:mm") }));
  };

  const quickOptions = [
    { label: '30 Min', minutes: 30 },
    { label: '1 Hour',  minutes: 60 },
    { label: '2 Hours', minutes: 120 },
    {
      label: 'Tomorrow',
      minutes: null,
      onClick: () => {
        const t = addDays(new Date(), 1);
        t.setHours(9, 0, 0, 0);
        setForm((f) => ({ ...f, reminderTime: format(t, "yyyy-MM-dd'T'HH:mm") }));
      },
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.reminderTime) {
      toast.error('Please fill in name, phone, and reminder time.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await axios.post(`/api/reminder/update/${initial._id}`, form);
        toast.success('Reminder updated!');

        // Reschedule browser notifications for the updated reminder time
        scheduleReminderNotifications(form.name, form.phone, form.reminderTime);
      } else {
        await axios.post('/api/reminder/create', form);
        toast.success('Reminder created & synced to Google Calendar!');

        // Schedule multi-step browser notifications before the call time
        scheduleReminderNotifications(form.name, form.phone, form.reminderTime);

        setForm({ name: '', phone: '', notes: '', reminderTime: '' });
      }
      if (onSuccess) onSuccess();
      else router.push('/reminders');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Contact Name *
          </label>
          <input
            className="form-input"
            placeholder="e.g. Rahul Sharma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Phone Number *
          </label>
          <input
            className="form-input"
            placeholder="e.g. +91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Notes
        </label>
        <textarea
          rows={3}
          className="form-input resize-none"
          placeholder="Add any notes about the call (e.g. 'Interested in Plan A')"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      {/* Quick time buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Quick Schedule
        </label>
        <div className="flex flex-wrap gap-2">
          {quickOptions.map(({ label, minutes, onClick }) => (
            <button
              key={label}
              type="button"
              className="btn-quick"
              onClick={onClick || (() => setQuickTime(minutes))}
            >
              ⚡ {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date & time */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Reminder Date & Time *
        </label>
        <input
          type="datetime-local"
          className="form-input"
          value={form.reminderTime}
          onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* Calendar note */}
      <div className="flex items-start gap-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4">
        <span className="text-indigo-400 text-lg mt-0.5">🗓️</span>
        <div>
          <p className="text-sm font-medium text-indigo-300">Google Calendar Sync</p>
          <p className="text-xs text-slate-400 mt-0.5">
            A calendar event will be created automatically with a 10-minute reminder.
          </p>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {isEdit ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          <>{isEdit ? '✏️ Update Reminder' : '➕ Create Reminder'}</>
        )}
      </button>
    </form>
  );
}
