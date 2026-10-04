import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'SC-QPMS | Secure Cloud-Based Question Paper Management System',
  description:
    'Institutional-grade cloud platform for end-to-end cryptographic lifecycle management, AES-256 encryption, SHA-256 integrity verification, and controlled release of examination papers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">SC-QPMS Security Framework</span>
                <span>• Vercel Serverless Ready</span>
              </div>
              <div className="text-[11px] text-slate-400">
                AES-256 CBC • SHA-256 Verification • Strict Server-Side RBAC
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
