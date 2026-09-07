import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { SalesRecord } from '@/models/SalesRecord';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = session.user as any;

    let hasRealRecords = false;
    let topProduct = '';
    let topProductCount = 0;
    let topRegion = '';
    let topSpender = '';
    let topSpenderAmt = '';

    try {
      await connectDB();
      const isObjectId = mongoose.Types.ObjectId.isValid(companyId);
      const companyIdObj = isObjectId ? new mongoose.Types.ObjectId(companyId) : companyId;

      const recordsCount = await SalesRecord.countDocuments({ companyId: companyIdObj });
      if (recordsCount > 0) {
        hasRealRecords = true;
        const topProducts = await SalesRecord.aggregate([
          { $match: { companyId: companyIdObj } },
          { $group: { _id: '$product', count: { $sum: '$quantity' }, total_sales: { $sum: '$revenue' } } },
          { $sort: { count: -1 } },
          { $limit: 1 }
        ]);
        if (topProducts[0]) {
          topProduct = topProducts[0]._id;
          topProductCount = topProducts[0].count;
        }

        const topRegions = await SalesRecord.aggregate([
          { $match: { companyId: companyIdObj } },
          { $group: { _id: '$region', total_sales: { $sum: '$revenue' } } },
          { $sort: { total_sales: -1 } },
          { $limit: 1 }
        ]);
        if (topRegions[0]) topRegion = topRegions[0]._id;

        const topSpenders = await SalesRecord.aggregate([
          { $match: { companyId: companyIdObj } },
          { $group: { _id: '$customer', total_sales: { $sum: '$revenue' } } },
          { $sort: { total_sales: -1 } },
          { $limit: 1 }
        ]);
        if (topSpenders[0]) {
          topSpender = topSpenders[0]._id;
          topSpenderAmt = `₹${(topSpenders[0].total_sales || 0).toLocaleString('en-IN')}`;
        }
      }
    } catch (dbErr) {
      console.warn('Insights DB query warning:', dbErr);
    }

    if (!hasRealRecords) {
      return NextResponse.json({
        insights: [
          {
            type: 'trend',
            title: 'Sales Trend Alert',
            text: 'No transaction data available yet. Upload a CSV to enable predictive alerts.',
            color: 'border-l-purple-500',
            icon: 'trending'
          },
          {
            type: 'affinity',
            title: 'Product Affinity',
            text: 'Import product records to identify buyer basket associations.',
            color: 'border-l-pink-500',
            icon: 'shopping'
          },
          {
            type: 'warning',
            title: 'Inventory Warning',
            text: 'Database inventory empty. Upload files in the upload portal.',
            color: 'border-l-rose-500',
            icon: 'warning'
          }
        ]
      });
    }

    return NextResponse.json({
      insights: [
        {
          type: 'trend',
          title: 'Sales Trend Alert',
          text: `Peak zone demand centered in ${topRegion}. Consider prioritizing storage allocations in this terminal.`,
          color: 'border-l-purple-500',
          icon: 'trending'
        },
        {
          type: 'affinity',
          title: 'Product Affinity',
          text: `"${topProduct}" represents top demand volumes (${topProductCount} units). Offer bulk volume price brackets.`,
          color: 'border-l-pink-500',
          icon: 'shopping'
        },
        {
          type: 'warning',
          title: 'Loyalty Reward Warning',
          text: `VIP spender "${topSpender}" has logged ${topSpenderAmt} in purchases. Extend loyalty discounts to secure customer retention.`,
          color: 'border-l-rose-500',
          icon: 'warning'
        }
      ]
    });
  } catch (err: any) {
    console.error('Insights endpoint error:', err);
    return NextResponse.json({
      insights: [
        {
          type: 'trend',
          title: 'Sales Trend Alert',
          text: 'No transaction data available yet. Upload a CSV to enable predictive alerts.',
          color: 'border-l-purple-500',
          icon: 'trending'
        },
        {
          type: 'affinity',
          title: 'Product Affinity',
          text: 'Import product records to identify buyer basket associations.',
          color: 'border-l-pink-500',
          icon: 'shopping'
        },
        {
          type: 'warning',
          title: 'Inventory Warning',
          text: 'Database inventory empty. Upload files in the upload portal.',
          color: 'border-l-rose-500',
          icon: 'warning'
        }
      ]
    });
  }
}
}
