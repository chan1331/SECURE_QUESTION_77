'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import PaperTable from '@/components/PaperTable';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { IQuestionPaper } from '@/types/paper';
import { IUser, UserRole } from '@/types/auth';
import { IAuditLog, ISecurityEvent } from '@/types/audit';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  ScrollText,
  FileText,
  UserPlus,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'security' | 'papers'>('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'audit', 'security', 'papers'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    router.push(`/admin?tab=${tabId}`);
  };

  // Data states
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<ISecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User creation modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Question Setter');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Audit filter state
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditSearchPaper, setAuditSearchPaper] = useState('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [papersRes, usersRes, auditRes, secRes] = await Promise.all([
        fetch('/api/papers').then((r) => r.json()),
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/audit').then((r) => r.json()),
        fetch('/api/security-events').then((r) => r.json()),
      ]);

      if (papersRes.success) setPapers(papersRes.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (auditRes.success) setAuditLogs(auditRes.data || []);
      if (secRes.success) setSecurityEvents(secRes.data || []);
    } catch {
      setErrorMsg('Failed to aggregate system administrative data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to create user account.');
        setIsCreatingUser(false);
        return;
      }

      setSuccessMsg(`User ${newName} successfully enrolled with role ${newRole}.`);
      setIsUserModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchAllData();
    } catch {
      setErrorMsg('Network error while provisioning user.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserActive = async (user: IUser) => {
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to update account status.');
        return;
      }

      setSuccessMsg(`User ${user.email} is now ${!user.active ? 'Active' : 'Suspended'}.`);
      fetchAllData();
    } catch {
      setErrorMsg('Network error while toggling user status.');
    }
  };

  // Metrics computations
  const totalUsers = users.length;
  const totalPapers = papers.length;
  const createdCount = papers.filter((p) => p.status === 'Created').length;
  const reviewedCount = papers.filter((p) => p.status === 'Reviewed').length;
  const approvedCount = papers.filter((p) => p.status === 'Approved').length;
  const rejectedCount = papers.filter((p) => p.status === 'Rejected').length;
  const releasedCount = papers.filter((p) => p.releaseStatus === 'Released').length;
  const securityCount = securityEvents.length;

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditActionFilter && log.action !== auditActionFilter) return false;
    if (auditSearchPaper && !log.paperId?.toLowerCase().includes(auditSearchPaper.toLowerCase())) return false;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Institutional Header */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  Apex Administration Console
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  System Security & Institutional Governance
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time telemetry, role-based user management, immutable audit trails, and security event detection.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAllData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync
                </button>
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-indigo-300" />
                  Add User
                </button>
              </div>
            </div>

            {/* Notification Messages */}
            {errorMsg && (
              <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
            )}
            {successMsg && (
              <Toast type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
            )}

            {/* Metric Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">Total Users</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{totalUsers}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">Total Papers</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{totalPapers}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">Created</span>
                <span className="text-xl font-bold text-slate-700 mt-1 block">{createdCount}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-blue-600 block">Reviewed</span>
                <span className="text-xl font-bold text-blue-700 mt-1 block">{reviewedCount}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-emerald-600 block">Approved</span>
                <span className="text-xl font-bold text-emerald-700 mt-1 block">{approvedCount}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-red-600 block">Rejected</span>
                <span className="text-xl font-bold text-red-700 mt-1 block">{rejectedCount}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-indigo-600 block">Released</span>
                <span className="text-xl font-bold text-indigo-700 mt-1 block">{releasedCount}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="text-[10px] font-semibold uppercase text-rose-600 block">Security Incidents</span>
                <span className="text-xl font-bold text-rose-700 mt-1 block">{securityCount}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200">
              <nav className="flex space-x-6">
                {[
                  { id: 'overview', name: 'System Overview', icon: FileText },
                  { id: 'users', name: 'User Management', icon: Users },
                  { id: 'audit', name: 'Audit Logs', icon: ScrollText },
                  { id: 'security', name: 'Security Events', icon: ShieldAlert },
                  { id: 'papers', name: 'All Question Papers', icon: Lock },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-semibold transition ${
                        isActive
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Security Events */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Recent Security Events
                      </h3>
                      <button
                        onClick={() => handleTabChange('security')}
                        className="text-[11px] font-medium text-indigo-600 hover:underline"
                      >
                        View All ({securityEvents.length})
                      </button>
                    </div>
                    {securityEvents.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No security incidents detected.</p>
                    ) : (
                      <div className="space-y-2">
                        {securityEvents.slice(0, 5).map((ev) => (
                          <div key={ev._id} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800">{ev.eventType}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  ev.severity === 'CRITICAL'
                                    ? 'bg-red-100 text-red-800'
                                    : ev.severity === 'HIGH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {ev.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">{ev.description}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(ev.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Audit Actions */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <ScrollText className="w-4 h-4 text-indigo-600" />
                        Recent Sensitive Operations
                      </h3>
                      <button
                        onClick={() => handleTabChange('audit')}
                        className="text-[11px] font-medium text-indigo-600 hover:underline"
                      >
                        View All ({auditLogs.length})
                      </button>
                    </div>
                    {auditLogs.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No audit trail records.</p>
                    ) : (
                      <div className="space-y-2">
                        {auditLogs.slice(0, 5).map((log) => (
                          <div key={log._id} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-semibold text-slate-900">{log.action}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              User: {log.userEmail || 'System'} {log.paperId && `• Paper: ${log.paperId}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: User Management */}
            {activeTab === 'users' && (
              <div id="users" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Enrolled System Accounts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage cryptographic roles, clearance levels, and account active states
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUserModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add Account
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Account Status</th>
                        <th className="py-3 px-4">Enrolled Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {u.active ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                <XCircle className="w-3 h-3" /> Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleUserActive(u)}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded border transition ${
                                u.active
                                  ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700'
                                  : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.active ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Audit Logs */}
            {activeTab === 'audit' && (
              <div id="audit-logs" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Apex Audit Ledger
                    </h2>
                    <p className="text-xs text-slate-500">
                      Chronological log of system actions, logins, cryptographic operations, and release events
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    >
                      <option value="">All Actions</option>
                      <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                      <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                      <option value="PAPER_CREATED">PAPER_CREATED</option>
                      <option value="PAPER_REVIEWED">PAPER_REVIEWED</option>
                      <option value="PAPER_APPROVED">PAPER_APPROVED</option>
                      <option value="PAPER_REJECTED">PAPER_REJECTED</option>
                      <option value="PAPER_SCHEDULED">PAPER_SCHEDULED</option>
                      <option value="PAPER_RELEASED">PAPER_RELEASED</option>
                      <option value="UNAUTHORIZED_ACCESS">UNAUTHORIZED_ACCESS</option>
                      <option value="UNAUTHORIZED_DEVICE">UNAUTHORIZED_DEVICE</option>
                      <option value="INTEGRITY_FAILURE">INTEGRITY_FAILURE</option>
                    </select>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={auditSearchPaper}
                        onChange={(e) => setAuditSearchPaper(e.target.value)}
                        placeholder="Search Paper ID..."
                        className="pl-8 pr-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Paper ID</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Metadata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {filteredAuditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{log.action}</td>
                          <td className="py-2.5 px-4 text-slate-700">{log.userEmail || 'system'}</td>
                          <td className="py-2.5 px-4 text-indigo-700">{log.paperId || '—'}</td>
                          <td className="py-2.5 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                          <td className="py-2.5 px-4 text-slate-600 font-sans max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                            {JSON.stringify(log.metadata)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Security Events */}
            {activeTab === 'security' && (
              <div id="security-events" className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Security Incident & Threat Telemetry
                  </h2>
                  <p className="text-xs text-slate-500">
                    Detailed record of unauthorized access attempts, hardware mismatch, and integrity alerts
                  </p>
                </div>

                <div className="space-y-3">
                  {securityEvents.map((ev) => (
                    <div
                      key={ev._id}
                      className="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              ev.severity === 'CRITICAL'
                                ? 'bg-red-100 text-red-800'
                                : ev.severity === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ev.severity}
                          </span>
                          <span className="font-semibold text-xs text-slate-900">{ev.eventType}</span>
                        </div>
                        <p className="text-xs text-slate-700">{ev.description}</p>
                        <div className="text-[11px] text-slate-400 font-mono">
                          IP: {ev.ipAddress} {ev.deviceId && `• Device ID: ${ev.deviceId}`} {ev.targetPaperId && `• Paper: ${ev.targetPaperId}`}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                        {new Date(ev.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: All Question Papers */}
            {activeTab === 'papers' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Master Question Paper Inventory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive view of all encrypted question papers across all lifecycle stages
                  </p>
                </div>
                <PaperTable papers={papers} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* User Enrollment Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Provision New Institutional Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Dr. Robert Oppenheimer"
              className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Institutional Email Address
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@sc-qpms.edu"
              className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Initial Password (Min 6 Characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Role Clearance
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
            >
              <option value="Question Setter">Question Setter</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Examination Authority">Examination Authority</option>
              <option value="Examination Center">Examination Center</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingUser}
              className="px-4 py-2 text-xs font-semibold rounded text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition shadow-xs"
            >
              {isCreatingUser ? 'Enrolling...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading admin console...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
