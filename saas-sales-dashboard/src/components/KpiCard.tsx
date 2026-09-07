import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconBgClass?: string;
}

export default function KpiCard({
  title,
  value,
  description,
  icon,
  iconBgClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
}: KpiCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/0 rounded-full blur-xl group-hover:from-indigo-500/10 transition-all duration-300" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl border text-sm ${iconBgClass}`}>
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
