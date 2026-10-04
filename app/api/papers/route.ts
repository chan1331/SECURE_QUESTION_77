import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionPaper from '@/models/QuestionPaper';
import { encryptContent } from '@/lib/encryption';
import { generateHash } from '@/lib/hash';
import { validatePaperCreation, sanitizeString } from '@/lib/validation';
import { getClientInfo, logAuditEvent, logSecurityEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

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

    if (session.role !== 'Question Setter' && session.role !== 'Admin') {
      await logSecurityEvent({
        eventType: 'UNAUTHORIZED_PAPER_CREATION_ATTEMPT',
        severity: 'HIGH',
        description: `User ${session.email} with role '${session.role}' attempted to create a question paper.`,
        userId: session.userId,
        userEmail: session.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden. Only Question Setters can create papers.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = validatePaperCreation(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const title = sanitizeString(body.title);
    const content = sanitizeString(body.content);
    const examDate = sanitizeString(body.examDate);
    const examTimeRaw = body.examTime;

    // 1. Encrypt paper content with AES-256-CBC
    const { encryptedContent, iv } = encryptContent(content);

    // 2. Generate SHA-256 cryptographic integrity hash of plaintext
    const hash = generateHash(content);

    // 3. Generate structured unique Paper ID
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paperId = `QP-${year}-${randomSuffix}`;

    let parsedExamTime: Date | undefined;
    if (examTimeRaw) {
      const dt = new Date(examTimeRaw);
      if (!isNaN(dt.getTime())) {
        parsedExamTime = dt;
      }
    }

    await connectToDatabase();

    const newPaper = await QuestionPaper.create({
      paperId,
      title,
      encryptedContent,
      iv,
      hash,
      status: 'Created',
      examDate: examDate || undefined,
      examTime: parsedExamTime,
      releaseStatus: 'Locked',
      createdBy: session.userId,
    });

    // 4. Log Audit Event
    await logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: 'PAPER_CREATED',
      paperId: newPaper.paperId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: {
        title,
        hashPrefix: hash.substring(0, 16),
        examDate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Question paper successfully encrypted, hashed, and stored in locked state.',
        data: {
          paperId: newPaper.paperId,
          title: newPaper.title,
          status: newPaper.status,
          releaseStatus: newPaper.releaseStatus,
          hash: newPaper.hash,
          createdAt: newPaper.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Paper creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create question paper.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let query: Record<string, any> = {};

    if (session.role === 'Question Setter') {
      // Setters can only inspect their own question papers
      query = { createdBy: session.userId };
    } else if (session.role === 'Reviewer') {
      // Reviewers see papers awaiting review or already reviewed
      query = {};
    } else if (session.role === 'Examination Center') {
      // Examination centers only see scheduled or approved metadata
      query = { status: { $in: ['Approved'] } };
    }

    const papers = await QuestionPaper.find(query)
      .select('-encryptedContent -iv') // Crucial security guarantee: never expose ciphertext or IV
      .populate('createdBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: papers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to retrieve question papers.' },
      { status: 500 }
    );
  }
}
