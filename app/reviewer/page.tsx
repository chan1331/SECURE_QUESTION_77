'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import PaperTable from '@/components/PaperTable';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { IQuestionPaper } from '@/types/paper';
import { FileCheck2, ShieldCheck, CheckCircle2, XCircle, FileText, Hash, Calendar } from 'lucide-react';

export default function ReviewerPage() {
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedPaper, setSelectedPaper] = useState<IQuestionPaper | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<'Reviewed' | 'Rejected'>('Reviewed');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Metadata Modal State
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaDetails, setMetaDetails] = useState<any>(null);

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
      setErrorMsg('Failed to load question papers for review.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const openReviewModal = (paper: IQuestionPaper) => {
    setSelectedPaper(paper);
    setDecision('Reviewed');
    setComments(paper.reviewComments || '');
    setIsReviewModalOpen(true);
  };

  const openMetaModal = async (paper: IQuestionPaper) => {
    setSelectedPaper(paper);
    setIsMetaModalOpen(true);
    try {
      const res = await fetch(`/api/papers/${paper.paperId}`);
      const data = await res.json();
      if (data.success) {
        setMetaDetails(data.data);
      }
    } catch {
      // Fallback to paper object
    }
  };

  const handleTableAction = (paper: IQuestionPaper, actionType: string) => {
    if (actionType === 'primary') {
      openMetaModal(paper);
    } else if (actionType === 'secondary') {
      openReviewModal(paper);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;
    if (!comments.trim()) {
      setErrorMsg('Review comments and evaluation notes are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/papers/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: selectedPaper.paperId,
          decision,
          comments: comments.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to submit review.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Paper ${selectedPaper.paperId} has been marked as ${decision}.`);
      setIsReviewModalOpen(false);
      setSelectedPaper(null);
      setComments('');
      fetchPapers();
    } catch {
      setErrorMsg('Network error while recording academic review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingPapers = papers.filter((p) => p.status === 'Created');
  const reviewedPapers = papers.filter((p) => p.status !== 'Created');

  return (
    <ProtectedRoute allowedRoles={['Reviewer', 'Admin']}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 mb-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Academic Reviewer Module
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  Question Paper Peer Review & Quality Assurance Console
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect question paper metadata, evaluate syllabus compliance, and submit formal academic reviews.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded font-medium">
                  Pending Action: {pendingPapers.length} Papers
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

            {/* Section 1: Papers Awaiting Review */}
            <div id="pending-reviews" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Papers Awaiting Review
                  </h2>
                  <p className="text-xs text-slate-500">
                    Newly formulated examination papers awaiting academic verification
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
                  Loading papers pending review...
                </div>
              ) : (
                <PaperTable
                  papers={pendingPapers}
                  onAction={handleTableAction}
                  actionLabels={{
                    primary: 'View Metadata',
                    secondary: 'Review Paper',
                  }}
                  emptyMessage="All submitted examination papers have been reviewed."
                />
              )}
            </div>

            {/* Section 2: All Reviewed & Historical Papers */}
            <div id="review-history" className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Review History & Downstream Papers
                </h2>
                <p className="text-xs text-slate-500">
                  Papers already reviewed or processed along the security pipeline
                </p>
              </div>

              {isLoading ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                  Loading review logs...
                </div>
              ) : (
                <PaperTable
                  papers={reviewedPapers}
                  onAction={(paper) => openMetaModal(paper)}
                  actionLabels={{
                    primary: 'View Metadata',
                  }}
                  emptyMessage="No historical reviewed papers found."
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Academic Review: ${selectedPaper?.paperId}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="font-semibold text-slate-900 block">{selectedPaper?.title}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Integrity Hash: <span className="font-mono text-slate-700">{selectedPaper?.hash}</span>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Review Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('Reviewed')}
                className={`flex items-center justify-center gap-2 p-3 rounded border text-xs font-medium transition ${
                  decision === 'Reviewed'
                    ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Mark as Reviewed
              </button>

              <button
                type="button"
                onClick={() => setDecision('Rejected')}
                className={`flex items-center justify-center gap-2 p-3 rounded border text-xs font-medium transition ${
                  decision === 'Rejected'
                    ? 'bg-red-50 border-red-400 text-red-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-red-600" />
                Reject Paper
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Evaluation Comments & Academic Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Detail syllabus alignment, cognitive difficulty balance, or reasons for rejection..."
              className="w-full p-2.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition shadow-xs"
            >
              {isSubmitting ? 'Recording...' : 'Submit Official Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Metadata Detail Modal */}
      <Modal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        title={`Question Paper Details: ${selectedPaper?.paperId}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase text-[11px] block">Course Title</span>
            <span className="font-semibold text-slate-900 text-sm">{selectedPaper?.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Workflow State</span>
              <span className="font-semibold text-slate-800">{selectedPaper?.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Cryptographic Storage</span>
              <span className="font-semibold text-slate-800">{selectedPaper?.releaseStatus}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Target Exam Date</span>
              <span className="text-slate-800">{selectedPaper?.examDate || 'Not set'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Scheduled Exam Time</span>
              <span className="text-slate-800">
                {selectedPaper?.examTime ? new Date(selectedPaper.examTime).toLocaleString() : 'Not scheduled'}
              </span>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
              Cryptographic SHA-256 Digest
            </span>
            <div className="p-2 bg-slate-900 text-indigo-300 font-mono text-[11px] rounded break-all select-all">
              {selectedPaper?.hash}
            </div>
          </div>

          {metaDetails?.reviews && metaDetails.reviews.length > 0 && (
            <div className="pt-2">
              <span className="font-semibold text-slate-500 uppercase text-[11px] block mb-2">
                Review History Trail
              </span>
              <div className="space-y-2">
                {metaDetails.reviews.map((r: any) => (
                  <div key={r._id} className="p-2.5 rounded border border-slate-200 bg-white">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">{r.decision}</span>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 text-xs italic">&ldquo;{r.comments}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setIsMetaModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </ProtectedRoute>
  );
}
