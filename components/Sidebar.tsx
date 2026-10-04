'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  FilePlus2,
  FileCheck2,
  CalendarCheck2,
  KeyRound,
  ShieldAlert,
  Users,
  ScrollText,
  LayoutDashboard,
  Lock,
  ExternalLink,
} from 'lucide-react';

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;
  const currentTab = searchParams.get('tab');

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      if (pathname === path && hash) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL hash without reload
          window.history.pushState(null, '', `#${hash}`);
        }
      }
    }
  };

  const getNavItems = () => {
    switch (role) {
      case 'Question Setter':
        return [
          { name: 'Setter Workspace', href: '/setter', icon: LayoutDashboard },
          { name: 'Formulate Paper', href: '/setter#create-paper', icon: FilePlus2 },
          { name: 'Authored Papers List', href: '/setter#papers-list', icon: Lock },
        ];

      case 'Reviewer':
        return [
          { name: 'Reviewer Workspace', href: '/reviewer', icon: LayoutDashboard },
          { name: 'Papers Awaiting Review', href: '/reviewer#pending-reviews', icon: FileCheck2 },
          { name: 'Review History Trail', href: '/reviewer#review-history', icon: ScrollText },
        ];

      case 'Examination Authority':
        return [
          { name: 'Authority Workspace', href: '/authority', icon: LayoutDashboard },
          { name: 'Pending Approvals', href: '/authority#approvals', icon: FileCheck2 },
          { name: 'Exam Scheduling', href: '/authority#scheduling', icon: CalendarCheck2 },
          { name: 'Scheduled Inventory', href: '/authority#scheduled-papers', icon: Lock },
        ];

      case 'Examination Center':
        return [
          { name: 'Release Terminal', href: '/exam-center#terminal-form', icon: KeyRound },
          { name: 'Approved Papers List', href: '/exam-center#approved-inventory', icon: FileCheck2 },
        ];

      case 'Admin':
        return [
          { name: 'System Overview', href: '/admin?tab=overview', tab: 'overview', icon: LayoutDashboard },
          { name: 'User Management', href: '/admin?tab=users', tab: 'users', icon: Users },
          { name: 'Audit Trail Ledger', href: '/admin?tab=audit', tab: 'audit', icon: ScrollText },
          { name: 'Security Telemetry', href: '/admin?tab=security', tab: 'security', icon: ShieldAlert },
          { name: 'Master Papers Inventory', href: '/admin?tab=papers', tab: 'papers', icon: Lock },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Cross-cutting role portals for Super Admin
  const adminRolePortals = [
    { name: 'Setter Portal', href: '/setter', icon: FilePlus2 },
    { name: 'Reviewer Portal', href: '/reviewer', icon: FileCheck2 },
    { name: 'Authority Portal', href: '/authority', icon: CalendarCheck2 },
    { name: 'Exam Center Station', href: '/exam-center', icon: KeyRound },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {role} Workspace
          </div>
          <nav className="space-y-1 mt-2">
            {navItems.map((item: any) => {
              const Icon = item.icon;

              let isActive = false;
              if (item.tab) {
                isActive = pathname === '/admin' && (currentTab === item.tab || (!currentTab && item.tab === 'overview'));
              } else if (item.href.includes('#')) {
                const [targetPath] = item.href.split('#');
                isActive = pathname === targetPath;
              } else {
                isActive = pathname === item.href;
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Super Admin Cross-Portal Switcher */}
        {role === 'Admin' && (
          <div className="pt-4 border-t border-slate-200">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>All Role Portals</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded">Admin</span>
            </div>
            <nav className="space-y-1 mt-2">
              {adminRolePortals.map((portal) => {
                const Icon = portal.icon;
                const isCurrent = pathname === portal.href;
                return (
                  <Link
                    key={portal.name}
                    href={portal.href}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs rounded transition ${
                      isCurrent
                        ? 'bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200/80'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{portal.name}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Security Status Box */}
      <div className="mt-8 border border-slate-200 bg-slate-50 p-3 rounded text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Cryptographic Shield Active
        </div>
        <div className="space-y-0.5 text-slate-500">
          <p>• AES-256 Symmetric Cipher</p>
          <p>• SHA-256 Integrity Verification</p>
          <p>• Server-Side RBAC Enforced</p>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4" />}>
      <SidebarContent />
    </Suspense>
  );
}
