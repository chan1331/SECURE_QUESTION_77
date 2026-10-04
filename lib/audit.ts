import { NextRequest } from 'next/server';
import AuditLog from '../models/AuditLog';
import SecurityEvent from '../models/SecurityEvent';
import { AuditAction } from '../types/audit';

export function getClientInfo(req?: NextRequest) {
  if (!req) {
    return { ipAddress: '127.0.0.1', userAgent: 'internal' };
  }
  const forwarded = req.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  return { ipAddress, userAgent };
}

export async function logAuditEvent(params: {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  paperId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await AuditLog.create({
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      action: params.action,
      paperId: params.paperId,
      timestamp: new Date(),
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'system',
      metadata: params.metadata || {},
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function logSecurityEvent(params: {
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  userEmail?: string;
  targetPaperId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await SecurityEvent.create({
      eventType: params.eventType,
      severity: params.severity,
      description: params.description,
      userId: params.userId,
      userEmail: params.userEmail,
      targetPaperId: params.targetPaperId,
      deviceId: params.deviceId,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'system',
      timestamp: new Date(),
      metadata: params.metadata || {},
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
