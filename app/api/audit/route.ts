import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'Admin' && session.role !== 'Examination Authority') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Requires Admin or Examination Authority privilege.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const paperId = searchParams.get('paperId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

    await connectToDatabase();

    const query: Record<string, any> = {};
    if (action) query.action = action;
    if (paperId) query.paperId = paperId;

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching audit logs.' },
      { status: 500 }
    );
  }
}
