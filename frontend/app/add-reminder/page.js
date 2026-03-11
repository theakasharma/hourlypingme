import ReminderForm from '@/components/ReminderForm';

export const metadata = { title: 'Add Reminder - CallDesk CRM' };

export default function AddReminderPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-[#1e2132] border border-[#2d3148] rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📞</span> Schedule a Call Reminder
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Fill in the details below. A Google Calendar event will be created automatically.
          </p>
        </div>
        <ReminderForm />
      </div>
    </div>
  );
}
