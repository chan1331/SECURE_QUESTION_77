import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionPaper from '@/models/QuestionPaper';
import Review from '@/models/Review';
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

    if (session.role !== 'Reviewer' && session.role !== 'Admin') {
      await logSecurityEvent({
        eventType: 'UNAUTHORIZED_PAPER_REVIEW_ATTEMPT',
        severity: 'HIGH',
        description: `User ${session.email} with role '${session.role}' attempted to review paper.`,
        userId: session.userId,
        userEmail: session.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden. Only designated Reviewers can perform reviews.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const paperId = sanitizeString(body.paperId);
    const decision = sanitizeString(body.decision);
    const comments = sanitizeString(body.comments);

    if (!paperId || !comments) {
      return NextResponse.json(
        { success: false, message: 'Paper ID and review comments are required.' },
        { status: 400 }
      );
    }

    if (decision !== 'Reviewed' && decision !== 'Rejected') {
      return NextResponse.json(
        { success: false, message: "Decision must be either 'Reviewed' or 'Rejected'." },
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

    // Update QuestionPaper
    paper.status = decision;
    paper.reviewedBy = session.userId as any;
    paper.reviewComments = comments;
    await paper.save();

    // Create Review record
    await Review.create({
      paperId: paper.paperId,
      reviewerId: session.userId,
      decision,
      comments,
    });

    // Log audit event
    await logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: decision === 'Reviewed' ? 'PAPER_REVIEWED' : 'PAPER_REJECTED',
      paperId: paper.paperId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { decision, commentsLength: comments.length },
    });

    return NextResponse.json({
      success: true,
      message: `Question paper successfully marked as ${decision}.`,
      data: {
        paperId: paper.paperId,
        status: paper.status,
      },
    });
  } catch (error: any) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing review.' },
      { status: 500 }
    );
  }
}
