import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ReminderPopup from '@/components/ReminderPopup';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'CallDesk CRM - Smart Call Reminders',
  description: 'Professional call reminder management system for your calling team.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0d1a] text-white">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-[260px]">
            <Header />
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <ReminderPopup />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2132',
              color: '#e2e8f0',
              border: '1px solid #2d3148',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e2132' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e2132' } },
          }}
        />
      </body>
    </html>
  );
}
