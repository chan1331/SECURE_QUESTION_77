import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, hashPassword } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { isValidEmail, isValidPassword, isValidRole, sanitizeString } from '@/lib/validation';
import { getClientInfo, logAuditEvent } from '@/lib/audit';

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

    await connectToDatabase();

    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching users.' },
      { status: 500 }
    );
  }
}

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

    if (session.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const name = sanitizeString(body.name);
    const email = sanitizeString(body.email).toLowerCase();
    const password = sanitizeString(body.password);
    const role = sanitizeString(body.role);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name is required (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role specified.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      active: true,
    });

    await logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: 'LOGIN_SUCCESS', // or administrative account creation
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { event: 'USER_CREATED', createdUserEmail: email, createdRole: role },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User '${name}' created successfully with role '${role}'.`,
        data: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          active: newUser.active,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating user account.' },
      { status: 500 }
    );
  }
}
