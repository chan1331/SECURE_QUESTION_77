import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  CalendarCheck2,
  KeyRound,
  FileText,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Database,
  History,
  Terminal,
  FilePlus2,
  ShieldAlert,
} from 'lucide-react';

export default function LandingPage() {
  const rolePortals = [
    {
      title: 'Question Setter Portal',
      role: 'Question Setter',
      href: '/login?role=setter',
      icon: FilePlus2,
      desc: 'Formulate examination papers with immediate AES-256-CBC ciphertext locking and SHA-256 digest hashing.',
      badge: 'Confidential Authoring',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Academic Reviewer Portal',
      role: 'Reviewer',
      href: '/login?role=reviewer',
      icon: FileCheck2,
      desc: 'Examine syllabus compliance, cognitive distribution, and record formal peer review evaluations.',
      badge: 'Academic Audit',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      title: 'Examination Authority Portal',
      role: 'Examination Authority',
      href: '/login?role=authority',
      icon: CalendarCheck2,
      desc: 'Council sign-off, board approvals, and precise state-synchronized examination timestamp scheduling.',
      badge: 'Apex Sign-Off',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Examination Center Terminal',
      role: 'Examination Center',
      href: '/login?role=center',
      icon: KeyRound,
      desc: 'Execute the 7-Gate Controlled Release handshake with hardware device ID verification and live decryption.',
      badge: 'Controlled Decryption',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      title: 'Apex Administration Console',
      role: 'Admin',
      href: '/login?role=admin',
      icon: ShieldAlert,
      desc: 'Manage user credentials, review immutable audit trail ledgers, and monitor real-time threat telemetry.',
      badge: 'System Governance',
      badgeColor: 'text-slate-800 bg-slate-100 border-slate-300',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Institutional Hero Banner */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-indigo-200 bg-indigo-50/70 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Standardized Examination Security Infrastructure
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Secure Cloud-Based Question Paper Management System
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              A secure role-based platform for creating, reviewing, approving, scheduling,
              and controlled release of examination question papers with zero premature disclosure.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-300" />
                Access Security Terminal
              </Link>
              <a
                href="#portals"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition shadow-xs"
              >
                Role Gateways
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Gateways */}
      <section id="portals" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Role-Based Access Gateways
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Dedicated institutional workspaces engineered for each stakeholder across the examination lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolePortals.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.role}
                  className="bg-slate-50/60 border border-slate-200 rounded-lg p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:bg-white transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {portal.desc}
                    </p>
                  </div>

                  <Link
                    href={portal.href}
                    className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition shadow-2xs"
                  >
                    <span>Sign In as {portal.role}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architectural Security Workflow Pipeline */}
      <section id="workflow" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Examination Paper Lifecycle Pipeline
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Strict multi-gate protocol protecting question papers against premature disclosure,
              unauthorized modifications, and tampering.
            </p>
          </div>

          {/* Workflow Stage Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-mono text-xs font-bold mb-3">
                  01
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Paper Authoring
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Question Setter composes exam content. Immediate client-side submission triggers server encryption.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                Role: Question Setter
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-mono text-xs font-bold mb-3">
                  02
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  AES & SHA Locking
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Server encrypts ciphertext via AES-256-CBC and generates SHA-256 cryptographic digest. Stored locked.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                Module: lib/encryption
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-mono text-xs font-bold mb-3">
                  03
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Peer Review
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Reviewer examines academic standards and syllabus alignment. Submits formal review or flags issues.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                Role: Reviewer
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-mono text-xs font-bold mb-3">
                  04
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CalendarCheck2 className="w-4 h-4 text-amber-600" />
                  Approval & Schedule
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Examination Authority formally approves paper and establishes immutable release timestamp.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                Role: Authority
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-mono text-xs font-bold mb-3">
                  05
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  Controlled Release
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  7-Gate verification at center: Device validation, scheduled time arrival, and SHA-256 integrity check.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                Role: Exam Center
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Guarantees & Cryptographic Pillars */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Institutional Security Standards
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Built on industry standards for state examination boards, universities, and certification councils.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="w-9 h-9 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Confidentiality (AES-256)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Raw questions are never stored in plain text. Symmetric AES-256-CBC cipher with unique initialization
                vectors ensures zero plaintext exposure even to database administrators.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Integrity (SHA-256 Digest)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Before any paper is decrypted for examination, its SHA-256 digest is re-computed and compared with
                the immutable original hash. Any bit-level modification halts release instantly.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="w-9 h-9 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Accountability & Audit Trails
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every sensitive operation—including creation, reviews, approvals, premature release attempts,
                and unauthorized device handshakes—is permanently logged in audit collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment & Architecture Callout */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Database className="w-3.5 h-3.5" /> Vercel Serverless + MongoDB Atlas Architecture
            </div>
            <h3 className="text-lg font-bold text-white">
              Cloud Native • Zero Local Server Dependency
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Engineered with stateless Next.js Route Handlers, pooled connection caching, and HTTP-only cookie
              security for instant deployment onto Vercel.
            </p>
          </div>
          <Link
            href="/login"
            className="shrink-0 px-5 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
          >
            Launch Security Console
          </Link>
        </div>
      </section>
    </div>
  );
}
