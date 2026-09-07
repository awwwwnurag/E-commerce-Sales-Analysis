'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Search, Settings, Globe, Compass, Loader2 } from 'lucide-react';

interface RegionalSalesData {
  region: string;
  total_sales: number;
}

export default function RegionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Dropdown lists
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<string[]>([]);
  
  // Filter states
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');

  // Dynamic state
  const [loadingData, setLoadingData] = useState(true);
  const [regionalStats, setRegionalStats] = useState<RegionalSalesData[]>([]);
  const [totalSalesSum, setTotalSalesSum] = useState(0);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Load dropdown lists metadata
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

  // Fetch real regional sales from the API
  useEffect(() => {
    if (status !== 'authenticated') return;
    async function fetchRegionalSales() {
      setLoadingData(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedLocation !== 'All') queryParams.append('region', selectedLocation);
        if (selectedProduct !== 'All') queryParams.append('product', selectedProduct);

        const res = await fetch(`/api/dashboard/regional-sales?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const stats = Array.isArray(data) ? data : (data.stats || []);
          setRegionalStats(stats);
          setGoogleMapsApiKey(data.googleMapsApiKey || '');


          
          const sum = stats.reduce((acc: number, item: RegionalSalesData) => acc + item.total_sales, 0);
          setTotalSalesSum(sum);
        }
      } catch (err) {
        console.error('Error fetching regional sales:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchRegionalSales();
  }, [status, selectedLocation, selectedProduct]);

  // Dynamic Leaflet Map loader
  useEffect(() => {
    if (loadingData || regionalStats.length === 0) return;

    // Load Leaflet CSS stylesheet dynamically
    const cssId = 'leaflet-css-link';
    let cssLink = document.getElementById(cssId) as HTMLLinkElement;
    if (!cssLink) {
      cssLink = document.createElement('link');
      cssLink.id = cssId;
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    // Load Leaflet JS dynamically
    const scriptId = 'leaflet-js-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeLeafletMap = () => {
      const L = (window as any).L;
      if (!L) return;

      const mapEl = document.getElementById('leaflet-map-canvas');
      if (!mapEl) return;

      // Clear previous Leaflet mapping registry instances to allow React hot-reload
      const container = L.DomUtil.get('leaflet-map-canvas');
      if (container) {
        (container as any)._leaflet_id = null;
      }

      // Initialize map centered at India center coordinate
      const map = L.map('leaflet-map-canvas', {
        zoomControl: false,
        attributionControl: false
      }).setView([20.5937, 78.9629], 4.8);

      // OpenStreetMap Tile Layer (No API Key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'map-tiles-dark'
      }).addTo(map);


      // Add Zoom control at bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Plot regional data nodes
      regionalStats.forEach((item, idx) => {
        let position: [number, number] = [20.5937, 78.9629];
        const regionLower = item.region.toLowerCase();
        if (regionLower.includes('north') || regionLower.includes('delhi')) {
          position = [28.6139, 77.2090];
        } else if (regionLower.includes('west') || regionLower.includes('mumbai') || regionLower.includes('gujarat')) {
          position = [19.0760, 72.8777];
        } else if (regionLower.includes('south') || regionLower.includes('bangalore') || regionLower.includes('chennai')) {
          position = [12.9716, 77.5946];
        } else if (regionLower.includes('east') || regionLower.includes('kolkata')) {
          position = [22.5726, 88.3639];
        } else {
          // Offsets for tiers
          const offsets: [number, number][] = [
            [26.8467, 80.9462], // Lucknow
            [23.0225, 72.5714], // Ahmedabad
            [17.3850, 78.4867], // Hyderabad
            [11.0168, 76.9558], // Coimbatore
          ];
          position = offsets[idx % offsets.length];
        }

        const markerColor = idx % 4 === 0 ? '#6344FF' : idx % 4 === 1 ? '#a855f7' : idx % 4 === 2 ? '#f43f5e' : '#10b981';

        // Add Leaflet circle marker
        const circle = L.circleMarker(position, {
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.6,
          weight: 2,
          radius: 12
        }).addTo(map);

        circle.bindPopup(
          `<div style="color: #000; font-family: sans-serif; font-size: 11px; padding: 2px; min-width: 120px;">
            <strong style="font-size: 12px; color: #1e1b4b;">${item.region} Zone</strong><br/>
            Sales Value: <strong>${formatCurrency(item.total_sales)}</strong>
          </div>`
        );
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.defer = true;
      script.onload = initializeLeafletMap;
      document.head.appendChild(script);
    } else {
      if ((window as any).L) {
        initializeLeafletMap();
      } else {
        script.addEventListener('load', initializeLeafletMap);
      }
    }
  }, [regionalStats, loadingData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getRegionPercentage = (sales: number) => {
    if (totalSalesSum === 0) return '0%';
    return `${Math.round((sales / totalSalesSum) * 100)}%`;
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090b11] text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pre-mapped coordinate nodes on the abstract map
  const regionCoords: Record<string, { top: string; left: string; color: string; ping: string }> = {
    'North': { top: '25%', left: '48%', color: 'bg-[#6344FF]', ping: 'bg-indigo-400' },
    'West': { top: '48%', left: '35%', color: 'bg-purple-600', ping: 'bg-purple-400' },
    'South': { top: '72%', left: '49%', color: 'bg-rose-600', ping: 'bg-rose-400' },
    'East': { top: '48%', left: '68%', color: 'bg-emerald-600', ping: 'bg-emerald-400' },
  };

  return (
    <div className="flex min-h-screen bg-[#090b11] text-slate-100 font-inter">
      {/* Col 1: Icon navigation sidebar */}
      <Navigation />

      {/* Col 2: Content panel */}
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        
        {/* Header toolbar */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-figtree">Regions</h1>
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

        {/* Heatmap Layout Module (Screenshot 4) */}
        <section className="bg-[#0e121a] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl glow-card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <h2 className="text-base font-bold text-white font-figtree">Interactive Geographic Heatmap</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">Visual representation of sales density across India.</p>

          {/* India Heatmap Mock Canvas */}
          <div className="h-96 w-full bg-[#090b11] border border-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center">
            {/* Real interactive Leaflet map container */}
            {!loadingData && regionalStats.length > 0 && (
              <div id="leaflet-map-canvas" className="absolute inset-0 w-full h-full z-10 animate-fadeIn" />
            )}

            {/* Background GRID grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {loadingData ? (
              <div className="flex flex-col items-center gap-2 z-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-500">Retrieving spatial analytics...</span>
              </div>
            ) : regionalStats.length === 0 ? (
              <div className="flex flex-col items-center text-center p-8 space-y-2 z-20">
                <Globe className="w-12 h-12 text-slate-700 opacity-40 animate-pulse" />
                <h3 className="text-sm font-bold text-white">No Spatial Ingestion Logged</h3>
                <p className="text-xs text-slate-500 max-w-xs">Upload a CSV file with valid location records to map transaction densities.</p>
              </div>
            ) : null}

            {/* Map label bottom right */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-medium text-slate-400 z-20">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>🗺️ Interactive Geographic Map (OpenStreetMap)</span>
            </div>
          </div>
        </section>

        {/* Region stats metrics ledger summary */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loadingData ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0e121a] border border-slate-900 p-4 rounded-xl space-y-3 animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-2/3" />
              </div>
            ))
          ) : regionalStats.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-slate-500">
              No regional details logged in files.
            </div>
          ) : (
            regionalStats.map((item) => {
              const match = Object.keys(regionCoords).find(key => 
                item.region.toLowerCase().includes(key.toLowerCase())
              ) || 'North';
              const coords = regionCoords[match];
              const borderAccent = match === 'North' ? 'hover:border-indigo-500 border-l-4 border-l-[#6344FF]' : match === 'West' ? 'hover:border-purple-500 border-l-4 border-l-purple-600' : match === 'South' ? 'hover:border-rose-500 border-l-4 border-l-rose-600' : 'hover:border-emerald-500 border-l-4 border-l-emerald-600';
              const progressBg = match === 'North' ? 'bg-[#6344FF]' : match === 'West' ? 'bg-purple-600' : match === 'South' ? 'bg-rose-600' : 'bg-emerald-600';
              const percentStr = getRegionPercentage(item.total_sales);

              return (
                <div key={item.region} className={`bg-[#0e121a] border border-slate-900 p-4 rounded-xl space-y-3 transition flex flex-col justify-between glow-card ${borderAccent}`}>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.region} Zone</span>
                      <span className="text-[9px] bg-white/5 border border-white/5 text-slate-300 px-1.5 py-0.5 rounded-full font-bold">
                        {percentStr} share
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-extrabold text-white font-figtree">{formatCurrency(item.total_sales)}</span>
                    </div>
                  </div>
                  
                  {/* Miniature progress bar */}
                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${progressBg}`} 
                      style={{ width: percentStr }} 
                    />
                  </div>
                </div>
              );
            })
          )}
        </section>

      </main>
    </div>
  );
}
