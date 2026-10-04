import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionPaper from '@/models/QuestionPaper';
import { sanitizeString } from '@/lib/validation';
import { getClientInfo, logAuditEvent, logSecurityEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const clientInfo = getClientInfo(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'Examination Authority' && session.role !== 'Admin') {
      await logSecurityEvent({
        eventType: 'UNAUTHORIZED_PAPER_REJECTION_ATTEMPT',
        severity: 'HIGH',
        description: `User ${session.email} with role '${session.role}' attempted to reject paper.`,
        userId: session.userId,
        userEmail: session.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden. Only Examination Authority can reject papers.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const paperId = sanitizeString(body.paperId);
    const reason = sanitizeString(body.reason);

    if (!paperId) {
      return NextResponse.json(
        { success: false, message: 'Paper ID is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const paper = await QuestionPaper.findOne({ paperId });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: 'Question paper not found.' },
        { status: 404 }
      );
    }

    paper.status = 'Rejected';
    if (reason) {
      paper.reviewComments = reason;
    }
    await paper.save();

    await logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: 'PAPER_REJECTED',
      paperId: paper.paperId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { reason },
    });

    return NextResponse.json({
      success: true,
      message: 'Question paper rejected by Examination Authority.',
      data: {
        paperId: paper.paperId,
        status: paper.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error rejecting paper.' },
      { status: 500 }
    );
  }
}
