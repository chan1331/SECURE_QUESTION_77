'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import PaperTable from '@/components/PaperTable';
import Toast from '@/components/Toast';
import { IQuestionPaper } from '@/types/paper';
import { FilePlus2, Lock, ShieldCheck, Hash, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function QuestionSetterPage() {
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdPaperInfo, setCreatedPaperInfo] = useState<{
    paperId: string;
    hash: string;
    status: string;
  } | null>(null);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/papers');
      const data = await res.json();
      if (data.success) {
        setPapers(data.data || []);
      }
    } catch {
      setErrorMsg('Failed to load authored question papers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and question paper content are strictly required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    setCreatedPaperInfo(null);

    try {
      const payload: Record<string, any> = {
        title: title.trim(),
        content: content.trim(),
        examDate: examDate || undefined,
      };

      if (examTime) {
        payload.examTime = new Date(examTime).toISOString();
      }

      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to create and encrypt question paper.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data.message);
      setCreatedPaperInfo({
        paperId: data.data.paperId,
        hash: data.data.hash,
        status: data.data.status,
      });

      // Clear form
      setTitle('');
      setContent('');
      setExamDate('');
      setExamTime('');

      // Refresh table
      fetchPapers();
    } catch (err: any) {
      setErrorMsg('Network error encountered while encrypting paper.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Question Setter', 'Admin']}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Institutional Header */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Question Setter Module
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  Examination Paper Authoring & Encryption Console
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authored papers are immediately transformed into AES-256 ciphertext and locked upon dispatch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded font-mono font-medium">
                  Status: LOCKED_STORAGE
                </span>
              </div>
            </div>

            {/* Notification Messages */}
            {errorMsg && (
              <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
            )}
            {successMsg && (
              <Toast type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
            )}

            {/* Cryptographic Result Card */}
            {createdPaperInfo && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 shadow-xs animate-in fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-emerald-950">
                      Paper Cryptographically Sealed & Ingested
                    </h3>
                    <p className="text-xs text-emerald-800">
                      The paper was encrypted via server-side AES-256-CBC and assigned a unique SHA-256 integrity digest.
                    </p>
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/80 p-2.5 rounded border border-emerald-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Paper ID</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">{createdPaperInfo.paperId}</div>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded border border-emerald-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">SHA-256 Integrity Hash</span>
                        <div className="font-mono text-slate-800 truncate mt-0.5" title={createdPaperInfo.hash}>
                          {createdPaperInfo.hash}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Creation Form Card */}
            <div id="create-paper" className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-200">
                <FilePlus2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  New Question Paper Formulation
                </h2>
              </div>

              <form onSubmit={handleCreatePaper} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Course / Examination Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CS-804: Advanced Cryptographic Protocols & Network Security"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Exam Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Proposed Exam Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Question Paper Content <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Plaintext is encrypted immediately upon submission
                    </span>
                  </div>
                  <textarea
                    required
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter exam questions, sections, marks allocation, and instructions..."
                    className="w-full p-3 font-mono text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition shadow-xs"
                  >
                    {isSubmitting ? (
                      <span>Encrypting & Ingesting...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-indigo-300" />
                        Create Question Paper
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Authored Question Papers Table */}
            <div id="papers-list" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Authored Papers in Secure Storage
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live audit overview of question papers authored under your credentials
                  </p>
                </div>
                <button
                  onClick={fetchPapers}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                >
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                  Retrieving authored question papers from cloud database...
                </div>
              ) : (
                <PaperTable
                  papers={papers}
                  emptyMessage="You have not created any question papers yet. Use the form above to formulate your first paper."
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
