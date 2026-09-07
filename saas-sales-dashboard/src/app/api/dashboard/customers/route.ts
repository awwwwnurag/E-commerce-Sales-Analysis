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

    const custMap: Record<string, { total_spend: number; total_orders: number; last_order_date: Date; email?: string }> = {};
    records.forEach((r) => {
      const c = r.customer || 'Guest Customer';
      if (!custMap[c]) {
        custMap[c] = {
          total_spend: 0,
          total_orders: 0,
          last_order_date: new Date(r.date),
          email: r.customerDetails || undefined,
        };
      }
      custMap[c].total_spend += r.revenue || 0;
      custMap[c].total_orders += 1;
      const d = new Date(r.date);
      if (d > custMap[c].last_order_date) {
        custMap[c].last_order_date = d;
      }
    });

    const customers = Object.entries(custMap)
      .map(([name, data]) => ({
        id: `cust_${name.replace(/\s+/g, '_')}`,
        name,
        email: data.email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        total_spend: Math.round(data.total_spend * 100) / 100,
        total_orders: data.total_orders,
        last_order_date: data.last_order_date.toISOString(),
      }))
      .sort((a, b) => b.total_spend - a.total_spend);

    return NextResponse.json(customers);
  } catch (err: any) {
    console.error('Customers API error:', err);
    return NextResponse.json([]);
  }
}
