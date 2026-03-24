import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'CallDesk CRM - Smart Call Reminders',
  description: 'Professional call reminder management system for your calling team.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0d1a] text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
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
        </AuthProvider>
      </body>
    </html>
  );
}
