import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionPaper from '@/models/QuestionPaper';
import { decryptContent } from '@/lib/encryption';
import { verifyHash } from '@/lib/hash';
import { validateReleaseRequest } from '@/lib/validation';
import { getClientInfo, logAuditEvent, logSecurityEvent } from '@/lib/audit';

function isAuthorizedDevice(deviceId: string): boolean {
  const allowedDevicesStr = process.env.AUTHORIZED_DEVICE_IDS || '';
  const allowedDevices = allowedDevicesStr
    .split(',')
    .map((d) => d.trim().toUpperCase())
    .filter(Boolean);

  // Fallback defaults if env is missing
  if (allowedDevices.length === 0) {
    allowedDevices.push('DEV-EC-HYD-001', 'DEV-EC-BLR-002', 'SECURE-TERMINAL-01');
  }

  return allowedDevices.includes(deviceId.trim().toUpperCase());
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const clientInfo = getClientInfo(req);

    // Gate 1: JWT Authentication
    if (!session) {
      await logSecurityEvent({
        eventType: 'UNAUTHENTICATED_RELEASE_ATTEMPT',
        severity: 'HIGH',
        description: 'Attempted question paper release without valid session token.',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Authentication required. Access denied.' },
        { status: 401 }
      );
    }

    // Gate 2: Examination Center Role Verification
    if (session.role !== 'Examination Center' && session.role !== 'Admin') {
      await logSecurityEvent({
        eventType: 'UNAUTHORIZED_ROLE_RELEASE_ATTEMPT',
        severity: 'HIGH',
        description: `User ${session.email} with unauthorized role '${session.role}' attempted paper release.`,
        userId: session.userId,
        userEmail: session.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden. Only Authorized Examination Center personnel can request paper release.',
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = validateReleaseRequest(body);

    if (!validation.valid || !validation.cleanPaperId || !validation.cleanDeviceId) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Paper ID and Device ID are required.' },
        { status: 400 }
      );
    }

    const { cleanPaperId: paperId, cleanDeviceId: deviceId } = validation;

    // Gate 6: Device Authorization (check early)
    if (!isAuthorizedDevice(deviceId)) {
      await logSecurityEvent({
        eventType: 'UNAUTHORIZED_DEVICE_RELEASE_ATTEMPT',
        severity: 'CRITICAL',
        description: `Release attempt from unregistered/unauthorized device: ${deviceId}`,
        userId: session.userId,
        userEmail: session.email,
        targetPaperId: paperId,
        deviceId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      await logAuditEvent({
        userId: session.userId,
        userEmail: session.email,
        userRole: session.role,
        action: 'UNAUTHORIZED_DEVICE',
        paperId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { attemptedDevice: deviceId },
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized examination device. Hardware ID is not registered in the institutional trust list.',
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Explicitly query paper with encryptedContent and iv
    const paper = await QuestionPaper.findOne({
      $or: [{ paperId }, { _id: paperId.match(/^[0-9a-fA-F]{24}$/) ? paperId : null }],
    }).select('+encryptedContent +iv');

    // Gate 3: Paper Existence
    if (!paper) {
      return NextResponse.json(
        { success: false, message: 'Question paper not found.' },
        { status: 404 }
      );
    }

    // Gate 4: Paper Approval Verification
    if (paper.status !== 'Approved') {
      await logSecurityEvent({
        eventType: 'UNAPPROVED_PAPER_RELEASE_ATTEMPT',
        severity: 'HIGH',
        description: `Attempt to release paper ${paperId} with status '${paper.status}'.`,
        userId: session.userId,
        userEmail: session.email,
        targetPaperId: paper.paperId,
        deviceId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Question paper has not been approved by the Examination Authority.',
        },
        { status: 403 }
      );
    }

    // Gate 5: Examination Time Verification
    const currentTime = new Date();
    if (!paper.examTime) {
      return NextResponse.json(
        {
          success: false,
          message: 'Question paper has not been scheduled with an examination time yet.',
        },
        { status: 403 }
      );
    }

    const scheduledExamTime = new Date(paper.examTime);
    if (currentTime.getTime() < scheduledExamTime.getTime()) {
      await logSecurityEvent({
        eventType: 'PREMATURE_RELEASE_ATTEMPT',
        severity: 'MEDIUM',
        description: `Early release attempt for paper ${paper.paperId}. Current: ${currentTime.toISOString()}, Scheduled: ${scheduledExamTime.toISOString()}`,
        userId: session.userId,
        userEmail: session.email,
        targetPaperId: paper.paperId,
        deviceId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Paper is locked until the scheduled examination time (${scheduledExamTime.toLocaleString()}).`,
        },
        { status: 403 }
      );
    }

    // Gate 7: Cryptographic Decryption & SHA-256 Integrity Verification
    let decryptedContent = '';
    try {
      decryptedContent = decryptContent(paper.encryptedContent, paper.iv);
    } catch (decryptErr: any) {
      await logSecurityEvent({
        eventType: 'DECRYPTION_FAILURE',
        severity: 'CRITICAL',
        description: `Decryption failed for paper ${paper.paperId}: ${decryptErr.message}`,
        userId: session.userId,
        userEmail: session.email,
        targetPaperId: paper.paperId,
        deviceId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Question paper decryption failed. Cryptographic error.' },
        { status: 500 }
      );
    }

    const isIntegrityValid = verifyHash(decryptedContent, paper.hash);

    if (!isIntegrityValid) {
      // TAMPERING DETECTED!
      await logSecurityEvent({
        eventType: 'INTEGRITY_TAMPERING_DETECTED',
        severity: 'CRITICAL',
        description: `SHA-256 integrity hash verification mismatch for paper ${paper.paperId}. Stored hash: ${paper.hash}`,
        userId: session.userId,
        userEmail: session.email,
        targetPaperId: paper.paperId,
        deviceId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      await logAuditEvent({
        userId: session.userId,
        userEmail: session.email,
        userRole: session.role,
        action: 'INTEGRITY_FAILURE',
        paperId: paper.paperId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Question paper integrity verification failed. Potential tampering detected.',
        },
        { status: 500 }
      );
    }

    // All 7 Gates Passed! Paper is authorized for controlled release.
    paper.releaseStatus = 'Released';
    paper.releasedAt = new Date();
    await paper.save();

    await logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: 'PAPER_RELEASED',
      paperId: paper.paperId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: {
        authorizedDevice: deviceId,
        integrityVerified: true,
        hashPrefix: paper.hash.substring(0, 16),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Question paper authenticated, decrypted, and integrity verified successfully.',
      data: {
        paperId: paper.paperId,
        title: paper.title,
        content: decryptedContent,
        hash: paper.hash,
        examDate: paper.examDate,
        examTime: paper.examTime,
        releasedAt: paper.releasedAt,
        releaseStatus: paper.releaseStatus,
        integrityVerified: true,
      },
    });
  } catch (error: any) {
    console.error('Paper release endpoint error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error executing secure release protocol.' },
      { status: 500 }
    );
  }
}
