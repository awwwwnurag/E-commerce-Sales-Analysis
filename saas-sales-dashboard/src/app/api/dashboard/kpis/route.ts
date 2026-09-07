import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { fetchSalesRecords } from '@/utils/dashboardHelper';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = session.user as any;
    const sp = req.nextUrl.searchParams;

    const records = await fetchSalesRecords(companyId || 'demo-company-id', {
      startDate: sp.get('start_date'),
      endDate: sp.get('end_date'),
      product: sp.get('product'),
      region: sp.get('region'),
    });

    if (records.length === 0) {
      return NextResponse.json({
        total_sales: 0,
        total_cost: 0,
        total_profit: 0,
        profit_margin_pct: 0,
        average_order_value: 0,
        total_orders: 0,
      });
    }

    const total_sales = records.reduce((acc, r) => acc + (r.revenue || 0), 0);
    const total_cost = records.reduce((acc, r) => acc + (r.cost || 0), 0);
    const total_profit = total_sales - total_cost;
    const profit_margin_pct = total_sales > 0 ? (total_profit / total_sales) * 100 : 0;
    const total_orders = records.length;
    const average_order_value = total_orders > 0 ? total_sales / total_orders : 0;

    return NextResponse.json({
      total_sales: Math.round(total_sales * 100) / 100,
      total_cost: Math.round(total_cost * 100) / 100,
      total_profit: Math.round(total_profit * 100) / 100,
      profit_margin_pct: Math.round(profit_margin_pct * 100) / 100,
      average_order_value: Math.round(average_order_value * 100) / 100,
      total_orders,
    });
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
