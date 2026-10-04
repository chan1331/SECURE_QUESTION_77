import { NextRequest, NextResponse } from 'next/server';
import { getCookieOptions, getSessionFromRequest } from '@/lib/auth';
import { getClientInfo, logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const clientInfo = getClientInfo(req);

    if (session) {
      await logAuditEvent({
        userId: session.userId,
        userEmail: session.email,
        userRole: session.role,
        action: 'LOGIN_SUCCESS', // or user session termination
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { event: 'USER_LOGOUT' },
      });
    }

    const cookieOptions = getCookieOptions();
    const response = NextResponse.json({
      success: true,
      message: 'Session terminated successfully.',
    });

    response.cookies.set({
      name: cookieOptions.name,
      value: '',
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: 0, // Clears the cookie
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Logout encountered an error.' },
      { status: 500 }
    );
  }
}
