import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { fetchSalesRecords } from '@/utils/dashboardHelper';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = session.user as any;
    const records = await fetchSalesRecords(companyId || 'demo-company-id');

    const productsSet = new Set<string>();
    const regionsSet = new Set<string>();

    records.forEach((r) => {
      if (r.product) productsSet.add(r.product);
      if (r.region) regionsSet.add(r.region);
    });

    const products = Array.from(productsSet).sort();
    const regions = Array.from(regionsSet).sort();

    return NextResponse.json({
      products,
      regions,
      company: {
        name: session.user.name ? `${session.user.name}'s Workspace` : 'SalesIQ Workspace',
        settings: { currency: 'INR', theme_color: '#6366f1' },
      },
    });
  } catch (err: any) {
    console.error('Meta error:', err);
    return NextResponse.json({
      products: [],
      regions: [],
      company: {
        name: 'SalesIQ Workspace',
        settings: { currency: 'INR', theme_color: '#6366f1' },
      },
    });
  }
}
