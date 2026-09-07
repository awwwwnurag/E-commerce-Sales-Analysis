import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { SalesRecord } from '@/models/SalesRecord';
import { Company } from '@/models/Company';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = session.user as any;
    let products: string[] = [];
    let regions: string[] = [];
    let company: any = null;

    try {
      await connectDB();
      const isObjectId = mongoose.Types.ObjectId.isValid(companyId);
      const oid = isObjectId ? new mongoose.Types.ObjectId(companyId) : companyId;

      const [p, r, c] = await Promise.all([
        SalesRecord.distinct('product', { companyId: oid }),
        SalesRecord.distinct('region', { companyId: oid }),
        isObjectId ? Company.findById(oid) : null,
      ]);

      products = (p || []).filter(Boolean).sort();
      regions = (r || []).filter(Boolean).sort();
      company = c;
    } catch (dbErr) {
      console.warn('Meta DB query warning (serving sample data):', dbErr);
    }

    const defaultProducts = [
      'Haldiram Sweets - Gulab Jamun',
      'Haldiram Namkeen - Bhujia Sev',
      'Haldiram Ready-to-Eat - Dal Makhani',
      'Haldiram Snacks - Soan Papdi',
      'Haldiram Beverages - Thandai Syrup',
    ];

    const defaultRegions = [
      'North America',
      'Europe',
      'Asia Pacific',
      'Latin America',
    ];

    return NextResponse.json({
      products,
      regions,
      company: company || {
        name: 'SalesIQ Workspace',
        settings: { currency: 'INR', theme_color: '#6366f1' }
      },
    });
  } catch (err: any) {
    console.error('Meta error:', err);
    return NextResponse.json({
      products: [],
      regions: [],
      company: {
        name: 'SalesIQ Workspace',
        settings: { currency: 'INR', theme_color: '#6366f1' }
      },
    });
  }
}
