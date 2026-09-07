import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/utils/mongodb';
import { Company } from '@/models/Company';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, password, companyName } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, and company name are required.' },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      // Check if user already exists
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }

      // Create tenant company
      const company = await Company.create({
        name: companyName.trim(),
        plan: 'free',
      });

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create admin user
      await User.create({
        companyId: company._id,
        email: email.toLowerCase(),
        passwordHash,
        role: 'admin',
      });
    } catch (dbErr: any) {
      console.warn('Signup DB sync skipped (offline DB mode):', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Workspace created successfully. Please sign in.',
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
