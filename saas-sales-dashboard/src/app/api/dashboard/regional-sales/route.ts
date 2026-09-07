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

    const regionMap: Record<string, number> = {};
    records.forEach((r) => {
      const reg = r.region || 'Unknown';
      regionMap[reg] = (regionMap[reg] || 0) + (r.revenue || 0);
    });

    const result = Object.entries(regionMap).map(([region, total_sales]) => ({
      region,
      total_sales: Math.round(total_sales * 100) / 100,
    })).sort((a, b) => b.total_sales - a.total_sales);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Regional sales error:', err);
    return NextResponse.json([]);
  }
}
