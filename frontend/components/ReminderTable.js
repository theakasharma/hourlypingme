'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ReminderForm from './ReminderForm';

const STATUS_BADGE = {
  Pending:   'badge badge-pending',
  Completed: 'badge badge-completed',
  Missed:    'badge badge-missed',
};

const STATUS_DOT = {
  Pending:   'bg-amber-400',
  Completed: 'bg-green-400',
  Missed:    'bg-red-400',
};

export default function ReminderTable({ reminders = [], onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    setDeletingId(id);
    try {
      await axios.post(`/api/reminder/delete/${id}`);
      toast.success('Reminder deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.post(`/api/reminder/complete/${id}`);
      toast.success('Marked as completed ✅');
      onRefresh();
    } catch {
      toast.error('Failed to update');
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-slate-400 font-medium">No reminders found</p>
        <p className="text-slate-600 text-sm mt-1">Create your first reminder to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1e2132] border border-[#2d3148] rounded-2xl p-6 w-full max-w-xl mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Edit Reminder</h3>
              <button
                onClick={() => setEditing(null)}
                className="text-slate-400 hover:text-white text-xl transition-colors"
              >
                ✕
              </button>
            </div>
            <ReminderForm
              initial={editing}
              onSuccess={() => { setEditing(null); onRefresh(); }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2d3148]">
              {['Contact', 'Phone', 'Reminder Time', 'Status', 'Notes', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] uppercase tracking-widest text-slate-500 font-semibold pb-3 px-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2132]">
            {reminders.map((r) => (
              <tr key={r._id} className="table-row-hover transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-300 font-mono text-xs">{r.phone}</td>
                <td className="px-4 py-4">
                  <div className="text-white text-xs font-semibold">
                    {format(new Date(r.reminderTime), 'dd MMM yyyy')}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {format(new Date(r.reminderTime), 'hh:mm a')}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={STATUS_BADGE[r.status] || 'badge'}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-400 text-xs max-w-[160px] truncate">
                  {r.notes || '—'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    {r.status === 'Pending' && (
                      <button
                        onClick={() => handleComplete(r._id)}
                        className="px-2.5 py-1.5 bg-green-600/15 border border-green-500/30 text-green-400 hover:bg-green-600/30 rounded-lg text-[11px] font-medium transition-all"
                        title="Mark as Completed"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => setEditing(r)}
                      className="px-2.5 py-1.5 bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 rounded-lg text-[11px] font-medium transition-all"
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      className="px-2.5 py-1.5 bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === r._id ? '…' : '✕'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
