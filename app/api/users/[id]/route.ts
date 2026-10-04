import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { isValidRole } from '@/lib/validation';
import { getClientInfo, logAuditEvent } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await req.json().catch(() => ({}));

    await connectToDatabase();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    // Prevent deactivating own account
    if (targetUser._id.toString() === session.userId && body.active === false) {
      return NextResponse.json(
        { success: false, message: 'Cannot deactivate your own administrative account.' },
        { status: 400 }
      );
    }

    if (typeof body.active === 'boolean') {
      targetUser.active = body.active;
    }

    if (body.role && isValidRole(body.role)) {
      targetUser.role = body.role;
    }

    await targetUser.save();

    await logAuditEvent({
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: 'LOGIN_SUCCESS',
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: {
        event: 'USER_UPDATED',
        updatedUserId: targetUser._id.toString(),
        newActive: targetUser.active,
        newRole: targetUser.role,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully.',
      data: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        active: targetUser.active,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating user.' },
      { status: 500 }
    );
  }
}
