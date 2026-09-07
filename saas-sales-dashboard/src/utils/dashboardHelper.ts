import type { NextRequest } from 'next/server';
import { connectDB } from '@/utils/mongodb';
import { SalesRecord } from '@/models/SalesRecord';
import { inMemoryStore, InStoreRecord } from '@/utils/inMemoryStore';
import mongoose from 'mongoose';

export interface DashboardFilters {
  companyId: string;
  startDate?: string;
  endDate?: string;
  product?: string;
  region?: string;
}

export function getDashboardFilters(
  companyId: string,
  searchParams: URLSearchParams
): DashboardFilters {
  return {
    companyId,
    startDate: searchParams.get('start_date') ?? undefined,
    endDate: searchParams.get('end_date') ?? undefined,
    product: searchParams.get('product') ?? undefined,
    region: searchParams.get('region') ?? undefined,
  };
}

export function buildFilterQueryString(filters: Partial<DashboardFilters>): string {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('start_date', filters.startDate);
  if (filters.endDate) params.set('end_date', filters.endDate);
  if (filters.product) params.set('product', filters.product);
  if (filters.region) params.set('region', filters.region);
  return params.toString();
}

export async function fetchSalesRecords(
  companyId: string,
  filters?: {
    startDate?: string | null;
    endDate?: string | null;
    product?: string | null;
    region?: string | null;
  }
): Promise<InStoreRecord[]> {
  let records: InStoreRecord[] = [];
  try {
    await connectDB();
    const isObjectId = mongoose.Types.ObjectId.isValid(companyId);
    const matchCompany = isObjectId ? new mongoose.Types.ObjectId(companyId) : companyId;

    const match: Record<string, any> = { companyId: matchCompany };
    if (filters?.startDate || filters?.endDate) {
      match.date = {};
      if (filters.startDate) match.date.$gte = new Date(filters.startDate);
      if (filters.endDate) match.date.$lte = new Date(filters.endDate);
    }
    if (filters?.product && filters.product !== 'All') match.product = filters.product;
    if (filters?.region && filters.region !== 'All') match.region = filters.region;

    const dbRecords = await SalesRecord.find(match).sort({ date: -1 }).limit(5000).lean();
    if (dbRecords && dbRecords.length > 0) {
      records = dbRecords.map((r: any) => ({
        companyId: r.companyId.toString(),
        uploadId: r.uploadId?.toString(),
        date: r.date,
        product: r.product,
        quantity: Number(r.quantity || 1),
        revenue: Number(r.revenue || 0),
        cost: Number(r.cost || 0),
        customer: r.customer,
        region: r.region,
        customerDetails: r.customerDetails,
        category: r.category,
        discount: Number(r.discount || 0),
        channel: r.channel,
      }));
    }
  } catch (err) {
    console.warn('DB fetch failed, falling back to in-memory store:', err);
  }

  if (records.length === 0) {
    let memRecords = inMemoryStore.getRecords(companyId);
    if (memRecords.length === 0 && companyId !== 'demo-company-id') {
      memRecords = inMemoryStore.getRecords('demo-company-id');
    }

    records = memRecords.filter((r) => {
      if (filters?.product && filters.product !== 'All' && r.product !== filters.product) return false;
      if (filters?.region && filters.region !== 'All' && r.region !== filters.region) return false;
      if (filters?.startDate && new Date(r.date) < new Date(filters.startDate)) return false;
      if (filters?.endDate && new Date(r.date) > new Date(filters.endDate)) return false;
      return true;
    });
  }

  return records;
}
