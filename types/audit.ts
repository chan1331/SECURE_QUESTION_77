export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PAPER_CREATED'
  | 'PAPER_REVIEWED'
  | 'PAPER_APPROVED'
  | 'PAPER_REJECTED'
  | 'PAPER_SCHEDULED'
  | 'PAPER_RELEASED'
  | 'UNAUTHORIZED_ACCESS'
  | 'UNAUTHORIZED_DEVICE'
  | 'INTEGRITY_FAILURE';

export interface IAuditLog {
  _id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  paperId?: string;
  timestamp: string | Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface ISecurityEvent {
  _id: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  userEmail?: string;
  targetPaperId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string | Date;
  metadata?: Record<string, any>;
}
