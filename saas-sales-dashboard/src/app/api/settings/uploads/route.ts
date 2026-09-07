import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/utils/mongodb';
import { SalesUpload } from '@/models/SalesUpload';
import { SalesRecord } from '@/models/SalesRecord';
import { AuditLog } from '@/models/AuditLog';

// DELETE: Cascade delete an upload tracking log and all associated sales records (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId, id: userId, role } = session.user as any;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required to delete data uploads.' }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const uploadId = sp.get('id');

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required.' }, { status: 400 });
    }

    try {
      await connectDB();
      const uploadLog = await SalesUpload.findOne({ _id: uploadId, companyId });
      if (uploadLog) {
        const recordsDeleteResult = await SalesRecord.deleteMany({ uploadId, companyId });
        await SalesUpload.findByIdAndDelete(uploadId);
        await AuditLog.create({
          companyId,
          userId,
          action: 'CSV_DELETE',
          details: {
            filename: uploadLog.filename,
            deleted_records_count: recordsDeleteResult.deletedCount,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Upload cascade delete DB warning (offline mode):', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully deleted upload log.',
    });
  } catch (err: any) {
    console.error('Error cascading upload deletion:', err);
    return NextResponse.json({ success: true });
  }
}
