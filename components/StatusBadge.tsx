import React from 'react';
import { PaperStatus, ReleaseStatus } from '@/types/paper';
import { Lock, Unlock, CheckCircle2, AlertCircle, Clock, FileCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: PaperStatus | ReleaseStatus | string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall
    ? 'text-xs px-2.5 py-0.5'
    : 'text-sm px-3 py-1';

  switch (status) {
    case 'Created':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded border border-slate-200 bg-slate-100 text-slate-700 ${sizeClasses}`}
        >
          <Clock className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          Created
        </span>
      );

    case 'Reviewed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded border border-blue-200 bg-blue-50 text-blue-700 ${sizeClasses}`}
        >
          <FileCheck className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          Reviewed
        </span>
      );

    case 'Approved':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded border border-emerald-200 bg-emerald-50 text-emerald-700 ${sizeClasses}`}
        >
          <CheckCircle2 className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          Approved
        </span>
      );

    case 'Rejected':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded border border-red-200 bg-red-50 text-red-700 ${sizeClasses}`}
        >
          <AlertCircle className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          Rejected
        </span>
      );

    case 'Locked':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded border border-amber-200 bg-amber-50 text-amber-700 ${sizeClasses}`}
        >
          <Lock className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          Encrypted & Locked
        </span>
      );

    case 'Released':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded border border-emerald-300 bg-emerald-100 text-emerald-800 ${sizeClasses}`}
        >
          <Unlock className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
          Decrypted & Released
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded border border-slate-200 bg-slate-50 text-slate-600 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
}
