import { UserRole } from '@/types/auth';

export const ROLES: Record<string, UserRole> = {
  SETTER: 'Question Setter',
  REVIEWER: 'Reviewer',
  AUTHORITY: 'Examination Authority',
  CENTER: 'Examination Center',
  ADMIN: 'Admin',
};

export const ROLE_PERMISSIONS: Record<UserRole, {
  canCreatePaper: boolean;
  canReviewPaper: boolean;
  canApprovePaper: boolean;
  canSchedulePaper: boolean;
  canReleasePaper: boolean;
  canManageUsers: boolean;
  canViewAudit: boolean;
  canViewSecurityEvents: boolean;
  canViewAllPapers: boolean;
}> = {
  'Question Setter': {
    canCreatePaper: true,
    canReviewPaper: false,
    canApprovePaper: false,
    canSchedulePaper: false,
    canReleasePaper: false,
    canManageUsers: false,
    canViewAudit: false,
    canViewSecurityEvents: false,
    canViewAllPapers: false,
  },
  'Reviewer': {
    canCreatePaper: false,
    canReviewPaper: true,
    canApprovePaper: false,
    canSchedulePaper: false,
    canReleasePaper: false,
    canManageUsers: false,
    canViewAudit: false,
    canViewSecurityEvents: false,
    canViewAllPapers: false,
  },
  'Examination Authority': {
    canCreatePaper: false,
    canReviewPaper: false,
    canApprovePaper: true,
    canSchedulePaper: true,
    canReleasePaper: false,
    canManageUsers: false,
    canViewAudit: false,
    canViewSecurityEvents: false,
    canViewAllPapers: true,
  },
  'Examination Center': {
    canCreatePaper: false,
    canReviewPaper: false,
    canApprovePaper: false,
    canSchedulePaper: false,
    canReleasePaper: true,
    canManageUsers: false,
    canViewAudit: false,
    canViewSecurityEvents: false,
    canViewAllPapers: false,
  },
  'Admin': {
    canCreatePaper: true,
    canReviewPaper: true,
    canApprovePaper: true,
    canSchedulePaper: true,
    canReleasePaper: true,
    canManageUsers: true,
    canViewAudit: true,
    canViewSecurityEvents: true,
    canViewAllPapers: true,
  },
};

/**
 * Checks whether user has one of the allowed roles.
 */
export function hasRequiredRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === 'Admin') return true; // Super admin has cross-cutting oversight
  return allowedRoles.includes(userRole);
}

/**
 * Maps role to default landing dashboard path.
 */
export function getDefaultRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'Question Setter':
      return '/setter';
    case 'Reviewer':
      return '/reviewer';
    case 'Examination Authority':
      return '/authority';
    case 'Examination Center':
      return '/exam-center';
    case 'Admin':
      return '/admin';
    default:
      return '/login';
  }
}
