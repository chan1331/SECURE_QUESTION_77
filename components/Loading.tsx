import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Verifying security credentials...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
      <p className="text-xs font-medium text-slate-600 tracking-wide">{message}</p>
    </div>
  );
}
