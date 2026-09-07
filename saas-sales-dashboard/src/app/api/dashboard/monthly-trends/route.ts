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

    const monthMap: Record<string, number> = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const monthStr = isNaN(d.getTime()) ? '2025-01' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[monthStr] = (monthMap[monthStr] || 0) + (r.revenue || 0);
    });

    const result = Object.entries(monthMap)
      .map(([month, total_sales]) => ({
        month,
        total_sales: Math.round(total_sales * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Monthly trends error:', err);
    return NextResponse.json([]);
  }
}
