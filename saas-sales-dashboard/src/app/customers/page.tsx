'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Search, Settings, Star, AlertCircle, Loader2, Users } from 'lucide-react';

interface CustomerKPIs {
  avg_clv: number;
  retention_rate: number;
  avg_purchases_year: number;
  high_value_count: number;
  churn_risk_count: number;
  high_value_buyers: string[];
  churn_risk_buyers: string[];
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Filter dropdown lists
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<string[]>([]);
  
  // Slicers
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');

  // Customer metrics
  const [loadingData, setLoadingData] = useState(true);
  const [metrics, setMetrics] = useState<CustomerKPIs>({
    avg_clv: 0,
    retention_rate: 0,
    avg_purchases_year: 0,
    high_value_count: 0,
    churn_risk_count: 0,
    high_value_buyers: [],
    churn_risk_buyers: []
  });

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Load slicer lists
  useEffect(() => {
    if (status !== 'authenticated') return;
    async function loadMeta() {
      try {
        const res = await fetch('/api/dashboard/meta');
        if (res.ok) {
          const data = await res.json();
          setRegionsList(data.regions || []);
          setProductsList(data.products || []);
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadMeta();
  }, [status]);

  // Fetch metrics from API
  useEffect(() => {
    if (status !== 'authenticated') return;
    async function fetchCustomerMetrics() {
      setLoadingData(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedLocation !== 'All') queryParams.append('region', selectedLocation);
        if (selectedProduct !== 'All') queryParams.append('product', selectedProduct);

        const res = await fetch(`/api/dashboard/customers?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching customer metrics:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchCustomerMetrics();
  }, [status, selectedLocation, selectedProduct]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090b11] text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = metrics.avg_clv > 0;

  return (
    <div className="flex min-h-screen bg-[#090b11] text-slate-100 font-inter">
      {/* Col 1: Icon navigation sidebar */}
      <Navigation />

      {/* Col 2: Content panel */}
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        
        {/* Header toolbar */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-figtree">Customers</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search across modules..." 
                className="bg-[#141822] border border-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 w-52"
              />
            </div>
            <button className="p-2 bg-[#141822] border border-slate-900 rounded-xl hover:text-white transition">
              <Settings className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Global dropdown filters */}
        <section className="flex flex-wrap gap-3 items-center text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2 bg-[#141822] border border-slate-900 rounded-xl px-3 py-2">
            <span>Location:</span>
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-950 text-white">All Regions</option>
              {regionsList.map((r) => (
                <option key={r} value={r} className="bg-slate-950 text-white">{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#141822] border border-slate-900 rounded-xl px-3 py-2">
            <span>Product Focus:</span>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-950 text-white">All Products</option>
              {productsList.map((p) => (
                <option key={p} value={p} className="bg-slate-950 text-white">{p}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Empty state alert banner if no CSV uploaded */}
        {!loadingData && !hasData && (
          <div className="bg-[#141822] border border-slate-900 rounded-xl p-8 text-center max-w-lg mx-auto space-y-4">
            <Users className="w-12 h-12 text-[#6344FF] mx-auto animate-pulse" />
            <h2 className="text-base font-bold text-white font-figtree">No Customer Ingestions Logged</h2>
            <p className="text-xs text-slate-500">
              Please upload a sales transaction CSV containing a valid Customer column to calculate lifetime value records.
            </p>
          </div>
        )}

        {(loadingData || hasData) && (
          <>
            {/* Panel 1: Customer Lifetime Value (Screenshot 5 top) */}
            <section className="bg-[#0e121a] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6344FF]" />
                <h2 className="text-base font-bold text-white font-figtree">Customer Lifetime Value (CLV)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-figtree">
                {/* Card 1 */}
                <div className="bg-[#141822] border border-slate-900 p-5 rounded-xl space-y-1 relative overflow-hidden border-b-2 border-b-[#6344FF]">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-inter">Avg CLV</span>
                  {loadingData ? (
                    <div className="h-9 bg-slate-800 rounded animate-pulse w-2/3 my-1" />
                  ) : (
                    <h3 className="text-3xl font-extrabold text-white">{formatCurrency(metrics.avg_clv)}</h3>
                  )}
                  <p className="text-[9px] text-slate-400 font-inter">Average revenue generated per buyer</p>
                </div>

                {/* Card 2 */}
                <div className="bg-[#141822] border border-slate-900 p-5 rounded-xl space-y-1 relative overflow-hidden border-b-2 border-b-purple-500">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-inter">Retention Rate</span>
                  {loadingData ? (
                    <div className="h-9 bg-slate-800 rounded animate-pulse w-2/3 my-1" />
                  ) : (
                    <h3 className="text-3xl font-extrabold text-white">{metrics.retention_rate}%</h3>
                  )}
                  <p className="text-[9px] text-slate-400 font-inter">Repeat transaction buyer share</p>
                </div>

                {/* Card 3 */}
                <div className="bg-[#141822] border border-slate-900 p-5 rounded-xl space-y-1 relative overflow-hidden border-b-2 border-b-rose-500">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-inter">Avg Purchases / Customer</span>
                  {loadingData ? (
                    <div className="h-9 bg-slate-800 rounded animate-pulse w-2/3 my-1" />
                  ) : (
                    <h3 className="text-3xl font-extrabold text-white">{metrics.avg_purchases_year}</h3>
                  )}
                  <p className="text-[9px] text-slate-400 font-inter">Frequency frequency score</p>
                </div>
              </div>

              {/* Visual Split Ratio progress bar indicator */}
              {!loadingData && (metrics.high_value_count + metrics.churn_risk_count) > 0 && (
                <div className="pt-6 border-t border-slate-900 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-amber-400">High-Value Cohort ({Math.round(metrics.high_value_count / (metrics.high_value_count + metrics.churn_risk_count || 1) * 100)}%)</span>
                    <span className="text-rose-400">Churn Risk Cohort ({Math.round(metrics.churn_risk_count / (metrics.high_value_count + metrics.churn_risk_count || 1) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      style={{ width: `${(metrics.high_value_count / (metrics.high_value_count + metrics.churn_risk_count || 1)) * 100}%` }} 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-l-full shadow-[0_0_8px_rgba(251,191,36,0.3)] transition-all duration-500" 
                    />
                    <div className="flex-1 h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-r-full shadow-[0_0_8px_rgba(244,63,94,0.3)] transition-all duration-500" />
                  </div>
                </div>
              )}
            </section>

            {/* Panel 2: Customer Cohorts (Screenshot 5 bottom) */}
            <section className="bg-[#0e121a] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <h2 className="text-base font-bold text-white font-figtree">Customer Cohorts</h2>
              </div>
              <p className="text-xs text-slate-400 -mt-2">Segmentation of users based on purchasing behavior.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cohort 1 */}
                <div className="bg-[#141822] border border-slate-900 p-6 rounded-xl space-y-3 relative overflow-hidden group hover:border-[#6344FF]/40 transition">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white font-bold font-figtree">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span>High-Value Buyers</span>
                    </div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
                      {metrics.high_value_count} customers
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-inter">
                    Contribute to 45% of total revenue. Average basket size &gt; ₹2,000.
                  </p>
                  {metrics.high_value_buyers.length > 0 && (
                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold">TOP CUSTOMERS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {metrics.high_value_buyers.map((name) => (
                          <span key={name} className="text-[9px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cohort 2 */}
                <div className="bg-[#141822] border border-slate-900 p-6 rounded-xl space-y-3 relative overflow-hidden group hover:border-rose-500/40 transition">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white font-bold font-figtree">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Churn Risk</span>
                    </div>
                    <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold">
                      {metrics.churn_risk_count} customers
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-inter">
                    Has not purchased in 6+ months. Target with discount campaigns.
                  </p>
                  {metrics.churn_risk_buyers.length > 0 && (
                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold">INACTIVE RECENTLY:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {metrics.churn_risk_buyers.map((name) => (
                          <span key={name} className="text-[9px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
}
