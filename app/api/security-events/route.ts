import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import SecurityEvent from '@/models/SecurityEvent';

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

    if (session.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

    await connectToDatabase();

    const query: Record<string, any> = {};
    if (severity) query.severity = severity;

    const events = await SecurityEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching security events.' },
      { status: 500 }
    );
  }
}
