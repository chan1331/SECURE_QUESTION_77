'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import PaperTable from '@/components/PaperTable';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { IQuestionPaper } from '@/types/paper';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CalendarCheck2,
  Lock,
  Clock,
  Calendar,
} from 'lucide-react';

export default function ExaminationAuthorityPage() {
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scheduling Modal State
  const [selectedPaper, setSelectedPaper] = useState<IQuestionPaper | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/papers');
      const data = await res.json();
      if (data.success) {
        setPapers(data.data || []);
      }
    } catch {
      setErrorMsg('Failed to load examination papers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleApprove = async (paper: IQuestionPaper) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/papers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.paperId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to approve paper.');
        return;
      }

      setSuccessMsg(`Paper ${paper.paperId} has been officially APPROVED.`);
      fetchPapers();
    } catch {
      setErrorMsg('Network error while processing approval.');
    }
  };

  const openRejectModal = (paper: IQuestionPaper) => {
    setSelectedPaper(paper);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;

    setIsSubmittingReject(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/papers/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: selectedPaper.paperId,
          reason: rejectReason.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to reject paper.');
        setIsSubmittingReject(false);
        return;
      }

      setSuccessMsg(`Paper ${selectedPaper.paperId} has been REJECTED.`);
      setIsRejectModalOpen(false);
      setSelectedPaper(null);
      fetchPapers();
    } catch {
      setErrorMsg('Network error while rejecting paper.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const openScheduleModal = (paper: IQuestionPaper) => {
    setSelectedPaper(paper);
    setScheduleDate(paper.examDate || new Date().toISOString().split('T')[0]);
    if (paper.examTime) {
      const d = new Date(paper.examTime);
      setScheduleTime(d.toISOString().slice(0, 16));
    } else {
      setScheduleTime('');
    }
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;
    if (!scheduleTime) {
      setErrorMsg('Please specify the exact examination timestamp.');
      return;
    }

    setIsSubmittingSchedule(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/papers/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: selectedPaper.paperId,
          examDate: scheduleDate,
          examTime: new Date(scheduleTime).toISOString(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to schedule exam.');
        setIsSubmittingSchedule(false);
        return;
      }

      setSuccessMsg(`Paper ${selectedPaper.paperId} scheduled and locked until examination time.`);
      setIsScheduleModalOpen(false);
      setSelectedPaper(null);
      fetchPapers();
    } catch {
      setErrorMsg('Network error while scheduling exam.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // Sections
  const pendingApprovals = papers.filter((p) => p.status === 'Reviewed');
  const approvedPapers = papers.filter((p) => p.status === 'Approved');
  const scheduledPapers = papers.filter((p) => p.status === 'Approved' && p.examTime);

  return (
    <ProtectedRoute allowedRoles={['Examination Authority', 'Admin']}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Examination Authority Console
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  Apex Board Approvals & Schedule Enforcement
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authority approval is mandatory before any examination paper can be scheduled and locked for release.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded font-medium">
                  Reviewed Awaiting Decision: {pendingApprovals.length}
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

            {/* Section 1: Pending Approvals */}
            <div id="approvals" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Section 1: Papers Pending Authority Approval
                  </h2>
                  <p className="text-xs text-slate-500">
                    Papers that passed academic peer-review and require formal apex council sign-off
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
                  Loading pending approvals...
                </div>
              ) : (
                <PaperTable
                  papers={pendingApprovals}
                  onAction={(paper, actionType) => {
                    if (actionType === 'secondary') handleApprove(paper);
                    if (actionType === 'danger') openRejectModal(paper);
                  }}
                  actionLabels={{
                    secondary: 'Approve Paper',
                    danger: 'Reject Paper',
                  }}
                  emptyMessage="No papers currently awaiting apex approval."
                />
              )}
            </div>

            {/* Section 2: Approved Papers & Scheduling */}
            <div id="scheduling" className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Section 2: Approved Papers (Ready for Exam Scheduling)
                </h2>
                <p className="text-xs text-slate-500">
                  Approved papers ready to receive synchronized state examination timestamps
                </p>
              </div>

              {isLoading ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                  Loading approved papers...
                </div>
              ) : (
                <PaperTable
                  papers={approvedPapers}
                  onAction={(paper, actionType) => {
                    if (actionType === 'primary') openScheduleModal(paper);
                  }}
                  actionLabels={{
                    primary: 'Schedule / Reschedule',
                  }}
                  emptyMessage="No approved question papers available."
                />
              )}
            </div>

            {/* Section 3: Scheduled Papers in Secure Lock */}
            <div id="scheduled-papers" className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Section 3: Scheduled & Locked Examination Inventory
                </h2>
                <p className="text-xs text-slate-500">
                  Papers cryptographically locked until their scheduled release time
                </p>
              </div>

              {isLoading ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                  Loading scheduled inventory...
                </div>
              ) : (
                <PaperTable
                  papers={scheduledPapers}
                  emptyMessage="No scheduled examination papers currently locked."
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Examination Scheduling Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule Examination Slot: ${selectedPaper?.paperId}`}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="font-semibold text-slate-900 block">{selectedPaper?.title}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Release Gate: Paper will remain sealed until current time ≥ scheduled exam time.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Exam Date
            </label>
            <input
              type="date"
              required
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Exact Examination Release Timestamp <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Set to a past time for immediate testing or future time to verify lock.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingSchedule}
              className="px-4 py-2 text-xs font-semibold rounded text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition shadow-xs"
            >
              {isSubmittingSchedule ? 'Locking Schedule...' : 'Confirm & Lock Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Question Paper: ${selectedPaper?.paperId}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Board Rejection
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State institutional or academic grounds for rejecting this paper..."
              className="w-full p-2.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-600 bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReject}
              className="px-4 py-2 text-xs font-semibold rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition shadow-xs"
            >
              {isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}
