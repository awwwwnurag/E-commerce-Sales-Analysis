'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import KpiCard from '@/components/KpiCard';
import UpgradeBanner from '@/components/UpgradeBanner';
import { 
  KpiRowSkeleton, ChartSkeleton, TableSkeleton 
} from '@/components/SkeletonLoader';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  DollarSign, ShoppingCart, Percent, TrendingUp, Filter, 
  Calendar, Inbox, Sparkles, UploadCloud, RefreshCw, ChevronRight 
} from 'lucide-react';

interface KpiData {
  total_sales: number;
  total_cost: number;
  total_profit: number;
  profit_margin_pct: number;
  average_order_value: number;
  total_orders: number;
}

interface RegionalSales {
  region: string;
  total_sales: number;
}

interface MonthlyTrend {
  month: string;
  total_sales: number;
}

interface TopProduct {
  product: string;
  total_sales: number;
  units_sold: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loader & Error states
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard Database States
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [regionalSales, setRegionalSales] = useState<RegionalSales[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  // Slicers Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Metadata for filter options
  const [productsList, setProductsList] = useState<string[]>([]);
  const [regionsList, setRegionsList] = useState<string[]>([]);

  // Company settings (currency formatting)
  const [companySettings, setCompanySettings] = useState<any>({
    currency: 'INR',
    theme_color: '#6366f1'
  });

  // Check if data is completely empty (no uploads yet)
  const isEmptyState = kpiData ? kpiData.total_orders === 0 && productsList.length === 0 : true;

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // Initialize dropdown metadata from API
  useEffect(() => {
    async function loadMetadata() {
      try {
        const metaRes = await fetch('/api/dashboard/meta');
        if (metaRes.ok) {
          const meta = await metaRes.json();
          setProductsList(meta.products || []);
          setRegionsList(meta.regions || []);
          if (meta.company?.settings) {
            setCompanySettings(meta.company.settings);
          }
        }
      } catch (err: any) {
        console.error('Error fetching metadata:', err);
      }
    }
    if (status === 'authenticated') loadMetadata();
  }, [status]);

  // Fetch Dashboard aggregate data based on active filters
  const fetchDashboardData = useCallback(async () => {
    setFetchingData(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);
    if (selectedProduct !== 'All') queryParams.set('product', selectedProduct);
    if (selectedRegion !== 'All') queryParams.set('region', selectedRegion);

    const urlParams = queryParams.toString() ? `?${queryParams.toString()}` : '';

    try {
      const [kpisRes, regionalRes, monthlyRes, productsRes] = await Promise.all([
        fetch(`/api/dashboard/kpis${urlParams}`),
        fetch(`/api/dashboard/regional-sales${urlParams}`),
        fetch(`/api/dashboard/monthly-trends${urlParams}`),
        fetch(`/api/dashboard/top-products${urlParams}`)
      ]);

      if (!kpisRes.ok || !regionalRes.ok || !monthlyRes.ok || !productsRes.ok) {
        throw new Error('Failed to fetch dashboard intelligence data.');
      }

      const [kpi, regional, monthly, products] = await Promise.all([
        kpisRes.json(),
        regionalRes.json(),
        monthlyRes.json(),
        productsRes.json()
      ]);

      setKpiData(kpi);
      setRegionalSales(regional.stats || []);
      setMonthlyTrends(monthly);
      setTopProducts(products);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setFetchingData(false);
      setLoading(false);
    }
  }, [startDate, endDate, selectedProduct, selectedRegion]);

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Currency formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: companySettings.currency || 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <UpgradeBanner />
      <div className="flex flex-1">
      <Navigation />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
              <Sparkles className="w-4 h-4" /> Live Sales Intelligence
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">SaaS Sales Dashboard</h1>
          </div>

          {/* Slicers Filters Bar */}
          {!loading && !isEmptyState && (
            <div className="flex flex-wrap items-center gap-4 bg-slate-900 border border-slate-800/80 p-3 rounded-2xl text-xs shadow-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Products</option>
                  {productsList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Regions</option>
                  {regionsList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchDashboardData}
                disabled={fetchingData}
                className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-50"
                title="Refresh visuals"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingData ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* LOADING STATES */}
        {loading ? (
          <div className="space-y-8">
            <KpiRowSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <TableSkeleton />
          </div>
        ) : isEmptyState ? (
          
          /* EMPTY STATE (No sales records uploaded yet) */
          <div className="max-w-2xl mx-auto my-12 text-center bg-slate-900 border border-slate-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full mb-6 w-16 h-16 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Sales Records Found</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
              Welcome to your new sales analytics workspace! To get started, upload a CSV file with your company transaction details.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-6 py-3 transition shadow-lg shadow-indigo-600/25"
            >
              Upload First CSV <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          
          /* RENDER REAL INTELLIGENCE DATA */
          <div className="space-y-8 relative">
            
            {/* KPI Cards Grid */}
            {kpiData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                  title="Total Sales"
                  value={formatCurrency(kpiData.total_sales)}
                  description="Aggregate transaction revenues"
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <KpiCard
                  title="Total Profit"
                  value={formatCurrency(kpiData.total_profit)}
                  description="Revenue minus cost of sales"
                  icon={<TrendingUp className="w-4 h-4" />}
                  iconBgClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                />
                <KpiCard
                  title="Profit Margin %"
                  value={`${kpiData.profit_margin_pct.toFixed(1)}%`}
                  description="Gross profit percentage margin"
                  icon={<Percent className="w-4 h-4" />}
                  iconBgClass="bg-pink-500/10 text-pink-400 border-pink-500/20"
                />
                <KpiCard
                  title="Avg Order Value"
                  value={formatCurrency(kpiData.average_order_value)}
                  description="Average sales size per invoice"
                  icon={<ShoppingCart className="w-4 h-4" />}
                  iconBgClass="bg-purple-500/10 text-purple-400 border-purple-500/20"
                />
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Monthly Sales Trends LineChart */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative">
                {fetchingData && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10" />
                )}
                <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
                  Monthly Trends
                </h3>
                <div className="h-80 w-full">
                  {monthlyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total_sales" 
                          name="Total Sales"
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          dot={{ fill: '#6366f1', r: 4 }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <Inbox className="w-8 h-8 opacity-45 mb-2" />
                      No trend data matches active filters.
                    </div>
                  )}
                </div>
              </div>

              {/* Regional Sales distribution BarChart */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative">
                {fetchingData && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10" />
                )}
                <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
                  Regional Sales
                </h3>
                <div className="h-80 w-full">
                  {regionalSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionalSales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="region" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Bar 
                          dataKey="total_sales" 
                          name="Sales Value"
                          fill="#ec4899" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <Inbox className="w-8 h-8 opacity-45 mb-2" />
                      No regional data matches active filters.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Top Products Table */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative">
              {fetchingData && (
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10" />
              )}
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Top 10 Products by Revenue
              </h3>
              <div className="overflow-x-auto">
                {topProducts.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4 text-right">Units Sold</th>
                        <th className="py-3 px-4 text-right">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-sm">
                      {topProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/20 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-medium text-white">{p.product}</td>
                          <td className="py-3.5 px-4 text-right text-slate-300">{p.units_sold.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right text-indigo-400 font-bold">
                            {formatCurrency(p.total_sales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Inbox className="w-8 h-8 opacity-45 mb-2" />
                    No product data matches active filters.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
      </div>
    </div>
  );
}
