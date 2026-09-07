import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { SalesRecord } from '@/models/SalesRecord';
import { Company } from '@/models/Company';

function buildMatch(companyId: string, sp: URLSearchParams) {
  const match: Record<string, any> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };
  const start = sp.get('start_date'), end = sp.get('end_date');
  if (start || end) {
    match.date = {};
    if (start) match.date.$gte = new Date(start);
    if (end) match.date.$lte = new Date(end);
  }
  const product = sp.get('product');
  const region = sp.get('region');
  if (product) match.product = product;
  if (region) match.region = region;
  return match;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = session.user as any;
    let result: any[] = [];
    let googleMapsApiKey = '';

    try {
      await connectDB();
      const isObjectId = mongoose.Types.ObjectId.isValid(companyId);
      const matchCompany = isObjectId ? new mongoose.Types.ObjectId(companyId) : companyId;

      const sp = req.nextUrl.searchParams;
      const match: Record<string, any> = { companyId: matchCompany };
      const start = sp.get('start_date'), end = sp.get('end_date');
      if (start || end) {
        match.date = {};
        if (start) match.date.$gte = new Date(start);
        if (end) match.date.$lte = new Date(end);
      }
      const product = sp.get('product');
      const region = sp.get('region');
      if (product && product !== 'All') match.product = product;
      if (region && region !== 'All') match.region = region;

      result = await SalesRecord.aggregate([
        { $match: match },
        { $group: { _id: '$region', total_sales: { $sum: '$revenue' } } },
        { $sort: { total_sales: -1 } },
        { $project: { _id: 0, region: '$_id', total_sales: { $round: ['$total_sales', 2] } } },
      ]);

      if (isObjectId) {
        const company = await Company.findById(companyId);
        googleMapsApiKey = company?.settings?.google_maps_api_key || '';
      }
    } catch (dbErr) {
      console.warn('Regional sales DB query warning (serving sample data):', dbErr);
    }

    return NextResponse.json({
      stats: (result && result.length > 0) ? result : [],
      googleMapsApiKey
    });
  } catch (err: any) {
    console.error('Regional sales error:', err);
    return NextResponse.json({
      stats: [],
      googleMapsApiKey: ''
    });
  }
}
