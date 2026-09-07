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

const DEFAULT_SAMPLE_RECORDS: InStoreRecord[] = [
  { companyId: 'default', date: '2025-01-15', product: 'Haldiram Bhujia Sev 400g', quantity: 45, revenue: 5400, cost: 3200, customer: 'Rajesh Sharma', region: 'North', category: 'Snacks' },
  { companyId: 'default', date: '2025-01-20', product: 'Haldiram Khatta Meetha 350g', quantity: 60, revenue: 5700, cost: 3420, customer: 'Priya Patel', region: 'West', category: 'Snacks' },
  { companyId: 'default', date: '2025-02-02', product: 'Haldiram Gulab Jamun 1kg', quantity: 30, revenue: 7200, cost: 4320, customer: 'Anjali Gupta', region: 'East', category: 'Sweets' },
  { companyId: 'default', date: '2025-02-10', product: 'Haldiram Soan Papdi 500g', quantity: 50, revenue: 8000, cost: 4800, customer: 'Vikram Singh', region: 'North', category: 'Sweets' },
  { companyId: 'default', date: '2025-02-18', product: 'Haldiram All in One Namkeen', quantity: 75, revenue: 9750, cost: 5850, customer: 'Rohan Mehta', region: 'South', category: 'Snacks' },
  { companyId: 'default', date: '2025-03-01', product: 'Haldiram Rasgulla 1kg', quantity: 25, revenue: 5750, cost: 3450, customer: 'Sneha Roy', region: 'East', category: 'Sweets' },
  { companyId: 'default', date: '2025-03-12', product: 'Haldiram Paneer Makhani RTE', quantity: 40, revenue: 7000, cost: 4200, customer: 'Karan Nair', region: 'South', category: 'Ready to Eat' },
  { companyId: 'default', date: '2025-03-22', product: 'Haldiram Moong Dal 200g', quantity: 100, revenue: 6500, cost: 3900, customer: 'Deepak Kumar', region: 'Central', category: 'Snacks' },
  { companyId: 'default', date: '2025-04-05', product: 'Haldiram Kaju Katli 250g', quantity: 20, revenue: 9000, cost: 5400, customer: 'Meera Reddy', region: 'North', category: 'Premium Sweets' },
  { companyId: 'default', date: '2025-04-18', product: 'Haldiram Aloo Bhujia 400g', quantity: 85, revenue: 9775, cost: 5865, customer: 'Sanjay Joshi', region: 'West', category: 'Snacks' }
];

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

    records = memRecords;


    records = records.filter((r) => {
      if (filters?.product && filters.product !== 'All' && r.product !== filters.product) return false;
      if (filters?.region && filters.region !== 'All' && r.region !== filters.region) return false;
      if (filters?.startDate && new Date(r.date) < new Date(filters.startDate)) return false;
      if (filters?.endDate && new Date(r.date) > new Date(filters.endDate)) return false;
      return true;
    });
  }

  return records;
}
