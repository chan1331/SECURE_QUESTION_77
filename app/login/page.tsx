'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Database,
  CheckCircle2,
  FilePlus2,
  FileCheck2,
  CalendarCheck2,
  Terminal,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import Toast from '@/components/Toast';

const DEMO_ACCOUNTS = [
  {
    role: 'Question Setter',
    key: 'setter',
    email: 'setter@sc-qpms.edu',
    password: 'SetterPassword@2026',
    desc: 'Paper formulation & AES-256 encryption',
    icon: FilePlus2,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    role: 'Reviewer',
    key: 'reviewer',
    email: 'reviewer@sc-qpms.edu',
    password: 'ReviewerPassword@2026',
    desc: 'Academic peer review & syllabus audit',
    icon: FileCheck2,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    role: 'Examination Authority',
    key: 'authority',
    email: 'authority@sc-qpms.edu',
    password: 'AuthorityPassword@2026',
    desc: 'Council approval & exam slot scheduling',
    icon: CalendarCheck2,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    role: 'Examination Center',
    key: 'center',
    email: 'center@sc-qpms.edu',
    password: 'CenterPassword@2026',
    desc: '7-Gate hardware release & decryption',
    icon: Terminal,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    role: 'Admin',
    key: 'admin',
    email: 'admin@sc-qpms.edu',
    password: 'AdminPassword@2026',
    desc: 'Audit trail ledger & threat telemetry',
    icon: ShieldAlert,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState('setter');
  const [email, setEmail] = useState('setter@sc-qpms.edu');
  const [password, setPassword] = useState('SetterPassword@2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState('');

  // Handle URL query parameter pre-selection
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const match = DEMO_ACCOUNTS.find(
        (a) => a.key === roleParam.toLowerCase() || a.role.toLowerCase() === roleParam.toLowerCase()
      );
      if (match) {
        setSelectedRole(match.key);
        setEmail(match.email);
        setPassword(match.password);
      }
    }
  }, [searchParams]);

  const handleRoleTabClick = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedRole(acc.key);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg('');
  };

  const handleQuickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedRole(acc.key);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg('');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // If demo user is not yet created in db, prompt user to initialize demo data
        if (data.message?.includes('Invalid credentials') || data.message?.includes('not found')) {
          setErrorMsg('Demo data not yet initialized. Click "Initialize Demo Data" below.');
        } else {
          setErrorMsg(data.message || 'Authentication failed.');
        }
        setIsSubmitting(false);
        return;
      }

      login(data.user);
      routeToRoleDashboard(data.user.role);
    } catch {
      setErrorMsg('Connection error during authentication.');
      setIsSubmitting(false);
    }
  };

  const routeToRoleDashboard = (role: string) => {
    switch (role) {
      case 'Question Setter':
        router.push('/setter');
        break;
      case 'Reviewer':
        router.push('/reviewer');
        break;
      case 'Examination Authority':
        router.push('/authority');
        break;
      case 'Examination Center':
        router.push('/exam-center');
        break;
      case 'Admin':
        router.push('/admin');
        break;
      default:
        router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Authentication failed. Please verify credentials.');
        setIsSubmitting(false);
        return;
      }

      login(data.user);
      routeToRoleDashboard(data.user.role);
    } catch {
      setErrorMsg('Unable to connect to the authentication service.');
      setIsSubmitting(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedSuccessMsg('Database initialized with demo credentials and sample question papers.');
      } else {
        setErrorMsg(data.message || 'Database initialization failed.');
      }
    } catch {
      setErrorMsg('Failed to trigger database seed script. Check MongoDB connection.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner Notice */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-indigo-200 bg-indigo-50/70 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Institutional Role Gateways
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Sign In to Examination Security Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select your institutional role clearance below to sign in or use the credentials form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form with Role Tabs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Role Clearance:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedRole === acc.key;
                return (
                  <button
                    key={acc.key}
                    type="button"
                    onClick={() => handleRoleTabClick(acc)}
                    className={`flex items-center gap-2 p-2.5 rounded border text-left text-xs transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{acc.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5">
              <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
            </div>
          )}

          {seedSuccessMsg && (
            <div className="mb-5">
              <Toast type="success" message={seedSuccessMsg} onClose={() => setSeedSuccessMsg('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sc-qpms.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition shadow-xs flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-indigo-300" />
                    Sign In to Console
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Server-side JWT in HTTP-Only Cookie</span>
            <span>AES-256 Gated Access</span>
          </div>
        </div>

        {/* Right Column: 1-Click Instant Login Portals */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1-Click Role Logins
                </h3>
                <p className="text-[11px] text-slate-500">
                  Instant authentication for immediate evaluator testing
                </p>
              </div>

              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded shadow-2xs transition"
                title="Seeds MongoDB with default users and test question papers"
              >
                <Database className="w-3 h-3 text-indigo-600" />
                {isSeeding ? 'Seeding...' : 'Initialize Demo Data'}
              </button>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={isSubmitting}
                    className="w-full text-left p-3 rounded border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition text-xs flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-700 mt-0.5 transition">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-900">
                          {acc.role}
                        </div>
                        <div className="text-[11px] text-slate-500">{acc.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 group-hover:text-indigo-800">
                      <span>Login</span>
                      <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Examination Center Terminal ID
            </div>
            <p className="text-[11px] text-slate-500">
              When releasing papers at the Center Terminal, use the authorized hardware signature:
            </p>
            <div className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
              DEV-EC-HYD-001
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading authentication portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
