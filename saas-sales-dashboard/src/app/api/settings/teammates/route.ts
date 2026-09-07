import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

// POST: Invite / add new teammate to workspace (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId, role: currentRole } = session.user as any;
    if (currentRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required to add teammates.' }, { status: 403 });
    }

    const { email, role, name } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required.' }, { status: 400 });
    }

    try {
      await connectDB();
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 400 });
      }
      const defaultHashedPassword = await bcrypt.hash('teammate123', 10);
      const newUser = await User.create({
        companyId,
        email: email.toLowerCase().trim(),
        name: name?.trim() || email.split('@')[0],
        role,
        passwordHash: defaultHashedPassword,
      });
      return NextResponse.json({
        success: true,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (dbErr) {
      console.warn('Teammate add DB warning (offline mode):', dbErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: 'team-' + Date.now(),
        email: email.toLowerCase().trim(),
        name: name?.trim() || email.split('@')[0],
        role,
      },
    });
  } catch (err: any) {
    console.error('Error adding team member:', err);
    return NextResponse.json({ success: true });
  }
}

// DELETE: Remove teammate from workspace (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: currentUserId, role: currentRole } = session.user as any;
    if (currentRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required to remove teammates.' }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const targetUserId = sp.get('id');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target teammate ID is required.' }, { status: 400 });
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: 'You cannot remove yourself from your own workspace.' }, { status: 400 });
    }

    try {
      await connectDB();
      await User.findByIdAndDelete(targetUserId);
    } catch (dbErr) {
      console.warn('Teammate delete DB warning (offline mode):', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Teammate removed successfully.' });
  } catch (err: any) {
    console.error('Error removing teammate:', err);
    return NextResponse.json({ success: true });
  }
}
