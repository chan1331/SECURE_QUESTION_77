'use client';

import React from 'react';
import { IQuestionPaper } from '@/types/paper';
import StatusBadge from './StatusBadge';
import { Calendar, Hash, User } from 'lucide-react';

interface PaperTableProps {
  papers: IQuestionPaper[];
  onAction?: (paper: IQuestionPaper, actionType: string) => void;
  actionLabels?: {
    primary?: string;
    secondary?: string;
    danger?: string;
  };
  emptyMessage?: string;
}

export default function PaperTable({
  papers,
  onAction,
  actionLabels,
  emptyMessage = 'No question papers found matching current filter.',
}: PaperTableProps) {
  if (!papers || papers.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Paper ID</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Integrity Hash</th>
              <th className="py-3 px-4">Exam Schedule</th>
              <th className="py-3 px-4">Workflow Status</th>
              {onAction && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {papers.map((paper) => {
              const authorName =
                typeof paper.createdBy === 'object' && paper.createdBy?.name
                  ? paper.createdBy.name
                  : 'Faculty Setter';

              return (
                <tr key={paper.paperId} className="hover:bg-slate-50/60 transition">
                  {/* Paper ID */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    {paper.paperId}
                  </td>

                  {/* Title */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate" title={paper.title}>
                      {paper.title}
                    </div>
                    {paper.reviewComments && (
                      <div className="text-[11px] text-slate-500 italic truncate mt-0.5" title={paper.reviewComments}>
                        Note: {paper.reviewComments}
                      </div>
                    )}
                  </td>

                  {/* Author */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{authorName}</span>
                    </div>
                  </td>

                  {/* Integrity Hash */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1" title={paper.hash}>
                      <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{paper.hash.substring(0, 12)}...</span>
                    </div>
                  </td>

                  {/* Exam Schedule */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {paper.examTime ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{new Date(paper.examTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    ) : paper.examDate ? (
                      <span className="text-slate-500">{paper.examDate}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unscheduled</span>
                    )}
                  </td>

                  {/* Workflow Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={paper.status} />
                  </td>

                  {/* Actions */}
                  {onAction && (
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {actionLabels?.primary && (
                        <button
                          onClick={() => onAction(paper, 'primary')}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition shadow-xs"
                        >
                          {actionLabels.primary}
                        </button>
                      )}
                      {actionLabels?.secondary && (
                        <button
                          onClick={() => onAction(paper, 'secondary')}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition shadow-xs"
                        >
                          {actionLabels.secondary}
                        </button>
                      )}
                      {actionLabels?.danger && (
                        <button
                          onClick={() => onAction(paper, 'danger')}
                          className="px-2.5 py-1 text-[11px] font-medium rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition shadow-xs"
                        >
                          {actionLabels.danger}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
