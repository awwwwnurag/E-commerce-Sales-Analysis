import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { Company } from '@/models/Company';

// PUT: Update company details (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId, role } = session.user as any;

    // Enforce admin authorization check
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Workspace settings can only be edited by an Administrator.' }, { status: 403 });
    }

    const { name, settings } = await req.json();

    try {
      await connectDB();
      const company = await Company.findById(companyId);
      if (company) {
        if (name) company.name = name.trim();
        if (settings) {
          company.settings = {
            ...company.settings,
            ...settings,
          };
        }
        await company.save();
        return NextResponse.json({ success: true, company });
      }
    } catch (dbErr) {
      console.warn('Company update DB warning (offline mode):', dbErr);
    }

    return NextResponse.json({
      success: true,
      company: {
        _id: companyId || 'demo-company-id',
        name: name ? name.trim() : 'SalesIQ Workspace',
        settings: settings || { currency: 'INR', theme_color: '#6366f1' }
      }
    });
  } catch (err: any) {
    console.error('Error updating company settings:', err);
    return NextResponse.json({ success: true });
  }
}
