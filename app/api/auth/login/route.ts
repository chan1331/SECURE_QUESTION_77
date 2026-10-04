import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken, getCookieOptions } from '@/lib/auth';
import { isValidEmail, sanitizeString } from '@/lib/validation';
import { getClientInfo, logAuditEvent, logSecurityEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const clientInfo = getClientInfo(req);
    const body = await req.json().catch(() => ({}));
    const email = sanitizeString(body.email).toLowerCase();
    const password = sanitizeString(body.password);

    if (!isValidEmail(email) || !password) {
      return NextResponse.json(
        { success: false, message: 'Valid email and password are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      await logAuditEvent({
        userEmail: email,
        action: 'LOGIN_FAILED',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { reason: 'User not found' },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid credentials provided.' },
        { status: 401 }
      );
    }

    if (!user.active) {
      await logSecurityEvent({
        eventType: 'SUSPENDED_ACCOUNT_ACCESS',
        severity: 'MEDIUM',
        description: `Login attempted for deactivated account: ${email}`,
        userId: user._id.toString(),
        userEmail: email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Contact administrator.' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      await logAuditEvent({
        userId: user._id.toString(),
        userEmail: email,
        userRole: user.role,
        action: 'LOGIN_FAILED',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { reason: 'Password mismatch' },
      });

      await logSecurityEvent({
        eventType: 'FAILED_AUTHENTICATION_ATTEMPT',
        severity: 'LOW',
        description: `Failed login attempt for user: ${email}`,
        userId: user._id.toString(),
        userEmail: email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      return NextResponse.json(
        { success: false, message: 'Invalid credentials provided.' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await logAuditEvent({
      userId: user._id.toString(),
      userEmail: email,
      userRole: user.role,
      action: 'LOGIN_SUCCESS',
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    const cookieOptions = getCookieOptions();
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: cookieOptions.name,
      value: token,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
