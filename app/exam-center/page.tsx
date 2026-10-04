'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import { IQuestionPaper } from '@/types/paper';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Cpu,
  Hash,
  Terminal,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export default function ExaminationCenterPage() {
  const [paperId, setPaperId] = useState('');
  const [deviceId, setDeviceId] = useState('DEV-EC-HYD-001');
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Scheduled papers list for reference
  const [scheduledPapers, setScheduledPapers] = useState<IQuestionPaper[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Decryption result state
  const [releasedPaper, setReleasedPaper] = useState<{
    paperId: string;
    title: string;
    content: string;
    hash: string;
    examDate?: string;
    examTime?: string;
    releasedAt?: string;
    integrityVerified: boolean;
  } | null>(null);

  // Security message banner
  const [securityError, setSecurityError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchScheduledPapers = async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch('/api/papers');
      const data = await res.json();
      if (data.success) {
        setScheduledPapers(data.data || []);
      }
    } catch {
      // Non-critical
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchScheduledPapers();
  }, []);

  const handleRequestRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperId.trim() || !deviceId.trim()) {
      setSecurityError('Both Paper ID and Device ID are mandatory for release handshake.');
      return;
    }

    setIsDecrypting(true);
    setSecurityError('');
    setSuccessMsg('');
    setReleasedPaper(null);

    try {
      const res = await fetch('/api/papers/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: paperId.trim(),
          deviceId: deviceId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSecurityError(data.message || 'Security gate failed. Access denied.');
        setIsDecrypting(false);
        return;
      }

      setReleasedPaper(data.data);
      setSuccessMsg(data.message || 'Question paper decrypted and integrity verified.');
      fetchScheduledPapers();
    } catch (err: any) {
      setSecurityError('Cryptographic release protocol failed due to a network or server error.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ProtectedRoute allowedRoles={['Examination Center', 'Admin']}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  Examination Center Terminal
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  Secure Controlled Release & Decryption Station
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Decryption is gated by role credentials, hardware terminal registration, apex approval,
                  synchronized exam timestamp, and SHA-256 integrity verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-900 text-indigo-300 px-3 py-1.5 rounded font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  STATION_ONLINE
                </span>
              </div>
            </div>

            {/* Notification & Security Error Banners */}
            {securityError && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 shadow-xs text-xs">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-950 uppercase tracking-wide">
                      Security Gate Protocol Rejection
                    </h3>
                    <p className="text-red-800 mt-1 font-medium">{securityError}</p>
                    <p className="text-[11px] text-red-600 mt-1">
                      This incident has been recorded in the apex audit ledger and security event log.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {successMsg && (
              <Toast type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
            )}

            {/* Decryption Handshake Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div id="terminal-form" className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
                <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-200">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Controlled Release Handshake
                  </h2>
                </div>

                <form onSubmit={handleRequestRelease} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Question Paper ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={paperId}
                        onChange={(e) => setPaperId(e.target.value)}
                        placeholder="e.g. QP-2026-3099"
                        className="w-full pl-9 pr-3 py-2 font-mono text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Authorized Device ID / Terminal Signature <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        placeholder="e.g. DEV-EC-HYD-001"
                        className="w-full pl-9 pr-3 py-2 font-mono text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Default authorized terminal: <span className="font-mono text-slate-600">DEV-EC-HYD-001</span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isDecrypting}
                      className="w-full py-2.5 px-4 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition shadow-xs flex items-center justify-center gap-2"
                    >
                      {isDecrypting ? (
                        <span>Executing 7-Gate Security Protocol...</span>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 text-indigo-300" />
                          Open Question Paper
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* 7 Verification Gates Indicator */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    7 Verification Gates Required:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      1. JWT Session
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      2. Center Role Clearance
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      3. Paper Existence
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      4. Authority Approval
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      5. Exam Time Elapsed
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      6. Authorized Device ID
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      7. SHA-256 Digest Integrity Match
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Inventory of Approved Papers */}
              <div id="approved-inventory" className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Approved Papers in Cloud Storage
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any Paper ID to auto-populate the release terminal
                    </p>
                  </div>
                  <button
                    onClick={fetchScheduledPapers}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                  >
                    Refresh
                  </button>
                </div>

                {isLoadingList ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Loading inventory...
                  </div>
                ) : scheduledPapers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-white rounded border border-slate-200">
                    No approved examination papers found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {scheduledPapers.map((p) => {
                      const isTimePassed = p.examTime ? new Date().getTime() >= new Date(p.examTime).getTime() : false;

                      return (
                        <div
                          key={p.paperId}
                          onClick={() => setPaperId(p.paperId)}
                          className="p-3 rounded border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition text-xs shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900">{p.paperId}</span>
                            {isTimePassed ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Exam Time Active
                              </span>
                            ) : p.examTime ? (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Locked Until Scheduled
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Unscheduled
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-800 truncate mt-1">{p.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {p.examTime ? new Date(p.examTime).toLocaleString() : 'No timestamp'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Decrypted Question Paper Presentation */}
            {releasedPaper && (
              <div className="bg-white border-2 border-emerald-500/80 rounded-lg p-6 sm:p-8 shadow-md animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                      <Unlock className="w-3.5 h-3.5" />
                      Paper Authenticated & Decrypted
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{releasedPaper.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Paper ID: <strong className="font-mono text-slate-800">{releasedPaper.paperId}</strong></span>
                      <span>•</span>
                      <span>Exam Date: <strong className="text-slate-800">{releasedPaper.examDate || 'Today'}</strong></span>
                      <span>•</span>
                      <span>Released: <strong className="text-slate-800">{new Date(releasedPaper.releasedAt || Date.now()).toLocaleTimeString()}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition shadow-xs"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      Print Question Paper
                    </button>
                  </div>
                </div>

                {/* Cryptographic Proof Banner */}
                <div className="my-4 p-3 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-700">
                      SHA-256 Digest Verified: Zero Content Tampering
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-sm" title={releasedPaper.hash}>
                    {releasedPaper.hash}
                  </span>
                </div>

                {/* Decrypted Content Box */}
                <div className="mt-4 p-6 bg-slate-50/50 rounded-lg border border-slate-200 font-mono text-xs sm:text-sm text-slate-900 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {releasedPaper.content}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
