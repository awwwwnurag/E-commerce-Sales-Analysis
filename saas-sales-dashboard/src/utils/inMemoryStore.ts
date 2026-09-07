// Global in-memory fallback store for offline/demo/Vercel environments without MongoDB

export interface InStoreRecord {
  companyId: string;
  uploadId?: string;
  date: Date | string;
  product: string;
  quantity: number;
  revenue: number;
  cost: number;
  customer: string;
  region: string;
  customerDetails?: string | null;
  category?: string;
  discount?: number;
  channel?: string;
}

interface InStoreUpload {
  id: string;
  companyId: string;
  filename: string;
  rowCount: number;
  createdAt: Date;
}

const memoryRecords: Map<string, InStoreRecord[]> = new Map();
const memoryUploads: Map<string, InStoreUpload[]> = new Map();

export const inMemoryStore = {
  addUpload(companyId: string, filename: string, rows: InStoreRecord[]) {
    const uploadId = `upload_${Date.now()}`;
    const formattedRows = rows.map((r) => ({
      ...r,
      companyId,
      uploadId,
      date: new Date(r.date || Date.now()),
      quantity: Number(r.quantity || 1),
      revenue: Number(r.revenue || 0),
      cost: Number(r.cost || 0),
    }));

    const existingRecords = memoryRecords.get(companyId) || [];
    memoryRecords.set(companyId, [...existingRecords, ...formattedRows]);

    const existingUploads = memoryUploads.get(companyId) || [];
    const newUpload: InStoreUpload = {
      id: uploadId,
      companyId,
      filename,
      rowCount: rows.length,
      createdAt: new Date(),
    };
    memoryUploads.set(companyId, [newUpload, ...existingUploads]);

    return { uploadId, count: rows.length };
  },

  getRecords(companyId: string): InStoreRecord[] {
    return memoryRecords.get(companyId) || [];
  },

  getUploads(companyId: string): InStoreUpload[] {
    return memoryUploads.get(companyId) || [];
  },

  deleteUpload(companyId: string, uploadId: string) {
    const records = memoryRecords.get(companyId) || [];
    memoryRecords.set(
      companyId,
      records.filter((r) => r.uploadId !== uploadId)
    );

    const uploads = memoryUploads.get(companyId) || [];
    memoryUploads.set(
      companyId,
      uploads.filter((u) => u.id !== uploadId)
    );
  },

  clearCompany(companyId: string) {
    memoryRecords.delete(companyId);
    memoryUploads.delete(companyId);
  },
};
