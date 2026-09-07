import React from 'react';

export function KpiCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-slate-800 rounded w-24" />
        <div className="h-8 w-8 bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-8 bg-slate-800 rounded w-32" />
        <div className="h-3 bg-slate-800 rounded w-48 mt-2" />
      </div>
    </div>
  );
}

export function KpiRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCardSkeleton />
      <KpiCardSkeleton />
      <KpiCardSkeleton />
      <KpiCardSkeleton />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-40 mb-6" />
      <div className="h-72 w-full bg-slate-950/40 rounded-xl flex items-end justify-between p-6 gap-2">
        <div className="h-1/3 bg-slate-800/30 rounded w-full" />
        <div className="h-1/2 bg-slate-800/30 rounded w-full" />
        <div className="h-3/4 bg-slate-800/30 rounded w-full" />
        <div className="h-2/3 bg-slate-800/30 rounded w-full" />
        <div className="h-5/6 bg-slate-800/30 rounded w-full" />
        <div className="h-1/2 bg-slate-800/30 rounded w-full" />
        <div className="h-3/4 bg-slate-800/30 rounded w-full" />
        <div className="h-2/3 bg-slate-800/30 rounded w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-48 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-850">
            <div className="h-4 bg-slate-800 rounded w-32" />
            <div className="h-4 bg-slate-800 rounded w-16" />
            <div className="h-4 bg-slate-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
