import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { SalesRecord } from '@/models/SalesRecord';

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

    let customerStats: any[] = [];
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

      customerStats = await SalesRecord.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$customer',
            total_revenue: { $sum: '$revenue' },
            order_count: { $sum: 1 },
            last_order_date: { $max: '$date' }
          }
        }
      ]);
    } catch (dbErr) {
      console.warn('Customer stats DB query warning (serving sample data):', dbErr);
    }

    if (customerStats.length === 0) {
      return NextResponse.json({
        avg_clv: 0,
        retention_rate: 0,
        avg_purchases_year: 0,
        high_value_count: 0,
        churn_risk_count: 0,
        high_value_buyers: [],
        churn_risk_buyers: []
      });
    }

    const totalCustomers = customerStats.length;
    const totalRevenue = customerStats.reduce((sum, c) => sum + c.total_revenue, 0);
    const totalOrders = customerStats.reduce((sum, c) => sum + c.order_count, 0);
    
    // Avg CLV
    const avgClv = Math.round(totalRevenue / totalCustomers);
    
    // Retention rate (customers with more than 1 order)
    const repeatCustomers = customerStats.filter(c => c.order_count > 1).length;
    const retentionRate = Math.round((repeatCustomers / totalCustomers) * 100);

    // Avg Purchases / Year
    const avgPurchases = Number((totalOrders / totalCustomers).toFixed(1));

    // High value threshold
    const highValueThreshold = avgClv * 0.8 || 1500;
    const highValueBuyers = customerStats
      .filter(c => c.total_revenue >= highValueThreshold)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .map(c => c._id);

    const sortedDates = [...customerStats].sort((a, b) => {
      const dateA = a.last_order_date ? new Date(a.last_order_date).getTime() : 0;
      const dateB = b.last_order_date ? new Date(b.last_order_date).getTime() : 0;
      const dateDiff = dateA - dateB;
      if (dateDiff !== 0) return dateDiff;
      return a.total_revenue - b.total_revenue;
    });

    const churnRiskBuyers = sortedDates
      .slice(0, Math.ceil(totalCustomers * 0.3))
      .map(c => c._id);

    return NextResponse.json({
      avg_clv: avgClv,
      retention_rate: retentionRate,
      avg_purchases_year: avgPurchases,
      high_value_count: highValueBuyers.length,
      churn_risk_count: churnRiskBuyers.length,
      high_value_buyers: highValueBuyers.slice(0, 5),
      churn_risk_buyers: churnRiskBuyers.slice(0, 5)
    });
  } catch (err: any) {
    console.error('Customer stats aggregation error:', err);
    return NextResponse.json({
      avg_clv: 0,
      retention_rate: 0,
      avg_purchases_year: 0,
      high_value_count: 0,
      churn_risk_count: 0,
      high_value_buyers: [],
      churn_risk_buyers: []
    });
  }
}
