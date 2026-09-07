import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { SalesUpload } from '@/models/SalesUpload';
import { SalesRecord } from '@/models/SalesRecord';
import { AuditLog } from '@/models/AuditLog';
import { inMemoryStore } from '@/utils/inMemoryStore';
import { fetchSalesRecords } from '@/utils/dashboardHelper';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId, id: userId } = session.user as any;
    const { filename, rows } = await req.json();

    if (!filename || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid upload payload.' }, { status: 400 });
    }

    const targetCompany = companyId || 'demo-company-id';
    inMemoryStore.addUpload(targetCompany, filename, rows);
    if (targetCompany !== 'demo-company-id') {
      inMemoryStore.addUpload('demo-company-id', filename, rows);
    }

    try {
      await connectDB();

      const uploadJob = await SalesUpload.create({
        companyId,
        uploadedBy: userId,
        filename,
        rowCount: rows.length,
        status: 'completed',
      });

      const recordsToInsert = rows.map((r) => ({
        companyId,
        uploadId: uploadJob._id,
        date: new Date(r.date || Date.now()),
        product: r.product,
        quantity: Number(r.quantity || 1),
        revenue: Number(r.revenue || 0),
        cost: Number(r.cost || 0),
        customer: r.customer,
        region: r.region,
        customerDetails: r.customerDetails || null,
        category: r.category || 'N/A',
        discount: Number(r.discount || 0),
        channel: r.channel || 'N/A',
      }));

      await SalesRecord.insertMany(recordsToInsert);

      await AuditLog.create({
        companyId,
        userId,
        action: 'CSV_UPLOAD',
        details: {
          filename,
          successful_rows: rows.length,
          failed_rows: 0,
        },
      });
    } catch (dbErr) {
      console.warn('Upload DB warning (offline mode):', dbErr);
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err: any) {
    console.error('API Upload error:', err);
    return NextResponse.json({ success: true, count: 0 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = session.user as any;
    const records = await fetchSalesRecords(companyId || 'demo-company-id');
    return NextResponse.json(records);
  } catch (err: any) {
    console.error('API get records error:', err);
    return NextResponse.json([]);
  }
}
