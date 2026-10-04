import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionPaper from '@/models/QuestionPaper';
import { sanitizeString, validateSchedule } from '@/lib/validation';
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
        eventType: 'UNAUTHORIZED_PAPER_SCHEDULE_ATTEMPT',
        severity: 'HIGH',
        description: `User ${session.email} with role '${session.role}' attempted to schedule exam.`,
        userId: session.userId,
        userEmail: session.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden. Only Examination Authority can schedule exams.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const paperId = sanitizeString(body.paperId);
    const examDate = sanitizeString(body.examDate);
    const scheduleValidation = validateSchedule({ examTime: body.examTime });

    if (!paperId) {
      return NextResponse.json(
        { success: false, message: 'Paper ID is required.' },
        { status: 400 }
      );
    }

    if (!scheduleValidation.valid || !scheduleValidation.parsedDate) {
      return NextResponse.json(
        { success: false, message: scheduleValidation.error },
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

    if (paper.status !== 'Approved') {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot schedule paper with status '${paper.status}'. Paper must be Approved prior to scheduling.`,
        },
        { status: 400 }
      );
    }

    paper.examTime = scheduleValidation.parsedDate;
    if (examDate) {
      paper.examDate = examDate;
    } else {
      paper.examDate = scheduleValidation.parsedDate.toISOString().split('T')[0];
    }
    paper.releaseStatus = 'Locked';
    await paper.save();

    await logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: 'PAPER_SCHEDULED',
      paperId: paper.paperId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: {
        examTime: scheduleValidation.parsedDate.toISOString(),
        examDate: paper.examDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Examination date and time scheduled successfully. Paper is securely locked.',
      data: {
        paperId: paper.paperId,
        examDate: paper.examDate,
        examTime: paper.examTime,
        releaseStatus: paper.releaseStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error scheduling paper.' },
      { status: 500 }
    );
  }
}
