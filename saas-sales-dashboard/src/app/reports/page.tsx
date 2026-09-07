'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Search, Settings, FileDown, FileText, Download, Loader2, FileSpreadsheet } from 'lucide-react';

interface SalesRecordData {
  _id: string;
  uploadId: string;
  date: string;
  product: string;
  quantity: number;
  revenue: number;
  cost: number;
  customer: string;
  region: string;
  category: string;
}

interface UploadLog {
  _id: string;
  filename: string;
  rowCount: number;
  uploadedAt: string;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [downloading, setDownloading] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Database state
  const [rawRecords, setRawRecords] = useState<SalesRecordData[]>([]);
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Load actual sales records and uploads history logs from DB APIs
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    async function loadData() {
      setLoadingHistory(true);
      try {
        // 1. Fetch raw sales records
        const recordsRes = await fetch('/api/upload');
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setRawRecords(recordsData || []);
        }

        // 2. Fetch upload logs from settings endpoint
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setUploadLogs(settingsData.uploads || []);
        }
      } catch (err) {
        console.error('Error loading reports data:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    
    loadData();
  }, [status]);

  const convertToCSVString = (records: SalesRecordData[]) => {
    const headers = ['Date', 'Product', 'Quantity', 'Revenue', 'Cost', 'Customer', 'Region', 'Category'];
    const rows = records.map(r => [
      r.date ? new Date(r.date).toISOString().split('T')[0] : '',
      `"${(r.product || '').replace(/"/g, '""')}"`,
      r.quantity || 0,
      r.revenue || 0,
      r.cost || 0,
      `"${(r.customer || '').replace(/"/g, '""')}"`,
      `"${(r.region || '').replace(/"/g, '""')}"`,
      `"${(r.category || 'N/A').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const handleExportCSV = () => {
    if (rawRecords.length === 0) {
      alert('No uploaded sales records found to export. Please upload a CSV first.');
      return;
    }

    setDownloading('csv');
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(convertToCSVString(rawRecords));
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `SalesIQ_Full_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
    }, 500);
  };

  const handleExportPDF = () => {
    if (rawRecords.length === 0) {
      alert('No uploaded sales records found to export. Please upload a CSV first.');
      return;
    }
    setDownloading('pdf');
    setTimeout(() => {
      window.print();
      setDownloading(null);
    }, 400);
  };

  const handleDownloadSpecificUpload = (logItem: UploadLog) => {
    // Filter records belonging specifically to this upload job
    const subset = rawRecords.filter(r => r.uploadId === logItem._id);
    if (subset.length === 0) {
      alert('No database records mapped to this upload. It may have been cleared.');
      return;
    }

    setDownloading(logItem._id);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(convertToCSVString(subset));
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `Export_${logItem.filename}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
    }, 500);
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090b11] text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = rawRecords.length > 0;

  return (
    <div className="flex min-h-screen bg-[#090b11] text-slate-100 font-inter">
      {/* Col 1: Icon navigation sidebar */}
      <Navigation />

      {/* Col 2: Content panel */}
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        
        {/* Header toolbar */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-figtree">Reports</h1>
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

        {/* Empty state alert banner if no CSV uploaded */}
        {!loadingHistory && !hasData && (
          <div className="bg-[#141822] border border-slate-900 rounded-xl p-8 text-center max-w-lg mx-auto space-y-4">
            <FileSpreadsheet className="w-12 h-12 text-[#8b5cf6] mx-auto animate-pulse" />
            <h2 className="text-base font-bold text-white font-figtree">No Reportable Logs Logged</h2>
            <p className="text-xs text-slate-500">
              Please upload a CSV files containing transaction lists to export generated charts and logs.
            </p>
          </div>
        )}

        {(loadingHistory || hasData) && (
          <>
            {/* Panel 1: Generate Custom Reports (Screenshot 2 top) */}
            <section className="bg-[#0e121a] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl space-y-6 glow-card">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6344FF]" />
                <h2 className="text-base font-bold text-white font-figtree">Generate Custom Reports</h2>
              </div>
              <p className="text-xs text-slate-400 -mt-2">Select parameters to export full Analytics data.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Button 1: PDF */}
                <button
                  onClick={handleExportPDF}
                  disabled={downloading !== null || loadingHistory}
                  className="flex items-center justify-center gap-2 bg-[#6344FF] hover:bg-[#4f35cf] disabled:bg-slate-800 text-white font-bold py-4 rounded-xl text-xs font-figtree transition-all shadow-[0_4px_20px_rgba(99,68,255,0.2)] glow-button"
                >
                  {downloading === 'pdf' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Export as PDF
                </button>

                {/* Button 2: Excel */}
                <button
                  onClick={handleExportCSV}
                  disabled={downloading !== null || loadingHistory}
                  className="flex items-center justify-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-slate-800 text-white font-bold py-4 rounded-xl text-xs font-figtree transition-all shadow-[0_4px_20px_rgba(139,92,246,0.2)] glow-button"
                >
                  {downloading === 'csv' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  Export as Excel (CSV)
                </button>
              </div>
            </section>

            {/* Panel 2: Recent Automated Reports (Screenshot 2 bottom) */}
            <section className="bg-[#0e121a] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl space-y-6 glow-card">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <h2 className="text-base font-bold text-white font-figtree">Recent Automated Reports</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 pb-3">
                      <th className="pb-3 font-semibold uppercase tracking-wider">Report Name</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider">Date Generated</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-inter">
                    {loadingHistory ? (
                      Array.from({ length: 2 }).map((_, idx) => (
                        <tr key={idx}>
                          <td className="py-4"><div className="h-4 bg-slate-850 rounded w-2/3 animate-pulse" /></td>
                          <td className="py-4"><div className="h-4 bg-slate-850 rounded w-1/3 animate-pulse" /></td>
                          <td className="py-4 text-right"><div className="h-7 w-7 bg-slate-850 rounded-lg animate-pulse ml-auto" /></td>
                        </tr>
                      ))
                    ) : uploadLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-500">
                          No history files detected. Try importing files in the CSV Upload portal.
                        </td>
                      </tr>
                    ) : (
                      uploadLogs.map((log) => (
                        <tr key={log._id} className="glow-row transition">
                          <td className="py-4 text-white font-semibold font-figtree">
                            Export Log - {log.filename}
                          </td>
                          <td className="py-4 text-slate-500">
                            {new Date(log.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleDownloadSpecificUpload(log)}
                              disabled={downloading !== null}
                              className="p-2 bg-[#141822] hover:bg-[#6344FF] border border-slate-900 rounded-xl text-slate-400 hover:text-white transition"
                              title="Download spreadsheet archive"
                            >
                              {downloading === log._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
}
