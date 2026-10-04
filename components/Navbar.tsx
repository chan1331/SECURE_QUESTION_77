'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { ShieldCheck, LogOut, User as UserIcon, Lock } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Institutional Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded border border-slate-300 bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-900 uppercase">
              SC-QPMS
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Secure Cloud Examination Security Platform
            </span>
          </div>
        </Link>

        {/* Right Authentication & Session Controls */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">{user.name}</span>
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60 inline-block self-end">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded transition shadow-xs"
                title="End current security session"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded transition shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-300" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
