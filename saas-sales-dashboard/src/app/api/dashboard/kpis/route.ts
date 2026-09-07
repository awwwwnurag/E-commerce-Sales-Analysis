import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { SalesRecord } from '@/models/SalesRecord';

function buildMatchStage(
  companyId: string,
  startDate?: string | null,
  endDate?: string | null,
  product?: string | null,
  region?: string | null
) {
  const match: Record<string, any> = {
    companyId: new (require('mongoose').Types.ObjectId)(companyId),
  };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }
  if (product) match.product = product;
  if (region) match.region = region;
  return match;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = session.user as any;
    const sp = req.nextUrl.searchParams;

    let result: any[] = [];
    try {
      await connectDB();
      const mongoose = require('mongoose');
      const isObjectId = mongoose.Types.ObjectId.isValid(companyId);
      const matchCompany = isObjectId ? new mongoose.Types.ObjectId(companyId) : companyId;

      const match: Record<string, any> = { companyId: matchCompany };
      const startDate = sp.get('start_date');
      const endDate = sp.get('end_date');
      if (startDate || endDate) {
        match.date = {};
        if (startDate) match.date.$gte = new Date(startDate);
        if (endDate) match.date.$lte = new Date(endDate);
      }
      const product = sp.get('product');
      const region = sp.get('region');
      if (product && product !== 'All') match.product = product;
      if (region && region !== 'All') match.region = region;

      result = await SalesRecord.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total_sales: { $sum: '$revenue' },
            total_cost: { $sum: '$cost' },
            total_orders: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            total_sales: { $round: ['$total_sales', 2] },
            total_cost: { $round: ['$total_cost', 2] },
            total_profit: { $round: [{ $subtract: ['$total_sales', '$total_cost'] }, 2] },
            profit_margin_pct: {
              $round: [
                {
                  $multiply: [
                    {
                      $cond: [
                        { $eq: ['$total_sales', 0] },
                        0,
                        { $divide: [{ $subtract: ['$total_sales', '$total_cost'] }, '$total_sales'] },
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
            average_order_value: {
              $round: [
                {
                  $cond: [
                    { $eq: ['$total_orders', 0] },
                    0,
                    { $divide: ['$total_sales', '$total_orders'] },
                  ],
                },
                2,
              ],
            },
            total_orders: 1,
          },
        },
      ]);
    } catch (dbErr) {
      console.warn('KPIs DB query warning (serving sample data):', dbErr);
    }

    const kpis = (result && result.length > 0) ? result[0] : {
      total_sales: 0,
      total_cost: 0,
      total_profit: 0,
      profit_margin_pct: 0,
      average_order_value: 0,
      total_orders: 0,
    };

    return NextResponse.json(kpis);
  } catch (err: any) {
    console.error('KPIs error:', err);
    return NextResponse.json({
      total_sales: 0,
      total_cost: 0,
      total_profit: 0,
      profit_margin_pct: 0,
      average_order_value: 0,
      total_orders: 0,
    });
  }
}
