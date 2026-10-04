'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types/auth';
import Loading from './Loading';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loading message="Authenticating institutional session..." />;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'Admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-red-200 rounded-lg shadow-sm text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Access Authorization Denied
        </h2>
        <p className="text-xs text-slate-600 mb-4">
          Your role (<span className="font-semibold">{user.role}</span>) does not hold
          the security clearances required to view this module.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Safe Area
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
