import type { NextRequest } from 'next/server';

export interface DashboardFilters {
  companyId: string;
  startDate?: string;
  endDate?: string;
  product?: string;
  region?: string;
}

/**
 * Extracts dashboard filter parameters from a search params object.
 * companyId must be passed in separately from the session.
 */
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

/**
 * Builds a query string from dashboard filters for use in fetch calls.
 */
export function buildFilterQueryString(filters: Partial<DashboardFilters>): string {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('start_date', filters.startDate);
  if (filters.endDate) params.set('end_date', filters.endDate);
  if (filters.product) params.set('product', filters.product);
  if (filters.region) params.set('region', filters.region);
  return params.toString();
}
