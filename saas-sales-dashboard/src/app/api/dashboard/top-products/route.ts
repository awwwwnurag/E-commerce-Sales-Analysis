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

    const prodMap: Record<string, { total_sales: number; units_sold: number }> = {};
    records.forEach((r) => {
      const p = r.product || 'Unknown Product';
      if (!prodMap[p]) prodMap[p] = { total_sales: 0, units_sold: 0 };
      prodMap[p].total_sales += r.revenue || 0;
      prodMap[p].units_sold += r.quantity || 1;
    });

    const result = Object.entries(prodMap)
      .map(([product, data]) => ({
        product,
        total_sales: Math.round(data.total_sales * 100) / 100,
        units_sold: data.units_sold,
      }))
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 10);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Top products error:', err);
    return NextResponse.json([]);
  }
}
