import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionPaper from '@/models/QuestionPaper';
import Review from '@/models/Review';
import AuditLog from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    const paper = await QuestionPaper.findOne({
      $or: [{ paperId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })
      .select('-encryptedContent -iv')
      .populate('createdBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .populate('approvedBy', 'name email role');

    if (!paper) {
      return NextResponse.json(
        { success: false, message: 'Question paper not found.' },
        { status: 404 }
      );
    }

    // Role verification: Question Setter can only view their own
    if (
      session.role === 'Question Setter' &&
      typeof paper.createdBy === 'object' &&
      (paper.createdBy as any)._id?.toString() !== session.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this question paper.' },
        { status: 403 }
      );
    }

    // Fetch related review notes
    const reviews = await Review.find({ paperId: paper.paperId })
      .populate('reviewerId', 'name email')
      .sort({ createdAt: -1 });

    // Fetch paper audit trail
    const auditLogs = await AuditLog.find({ paperId: paper.paperId })
      .sort({ timestamp: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        paper,
        reviews,
        auditLogs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching paper.' },
      { status: 500 }
    );
  }
}
