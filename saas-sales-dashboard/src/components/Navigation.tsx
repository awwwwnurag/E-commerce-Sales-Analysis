'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, UploadCloud, Settings, LogOut, Sparkles, 
  Users2, Globe, Brain, FileText, X, AlertTriangle, 
  TrendingUp, ShoppingBag, Loader2, Sparkle, User, Zap
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const [insights, setInsights] = useState<any[]>([
    {
      title: 'Sales Trend Alert',
      text: 'Weekend sales are 32% higher. Consider increasing ad spend on Saturdays.',
      color: 'border-l-purple-500',
      icon: 'trending'
    },
    {
      title: 'Product Affinity',
      text: '"Soan Papdi" and "Gift Boxes" are bought together 68% of the time. Create a bundle.',
      color: 'border-l-pink-500',
      icon: 'shopping'
    },
    {
      title: 'Inventory Warning',
      text: '"Aloo Bhujia" will stock out in 4 days at current sales velocity. Reorder immediately.',
      color: 'border-l-rose-500',
      icon: 'warning'
    }
  ]);

  const loadInsights = async () => {
    try {
      const res = await fetch('/api/dashboard/insights');
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setInsights(data.insights);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    }
  };

  useEffect(() => {
    if (isInsightsOpen) {
      loadInsights();
    }
  }, [isInsightsOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'CSV Upload', href: '/upload', icon: UploadCloud },
    { name: 'Customers', href: '/customers', icon: Users2 },
    { name: 'Regions', href: '/regions', icon: Globe },
    { name: 'Forecasting', href: '/forecasting', icon: Brain },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    try {
      await loadInsights();
    } finally {
      setTimeout(() => {
        setGeneratingInsights(false);
      }, 800);
    }
  };

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A';
  const plan = (session?.user as any)?.plan ?? 'free';

  return (
    <>
      {/* Click-outside backdrop to dismiss user dropdown */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      <aside className="w-20 bg-slate-950 border-r border-slate-900 flex flex-col justify-between items-center py-6 h-screen sticky top-0 z-40">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* User Profile Initial (Top) */}
          <div className="relative cursor-pointer">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-10 h-10 rounded-full bg-[#6344FF] text-white flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-105 focus:outline-none"
              aria-label="Toggle user menu"
            >
              {userInitial}
            </button>

            {/* Dropdown Menu (Screenshot 2 active state) */}
            {isUserMenuOpen && (
              <div className="absolute left-14 top-0 w-56 bg-slate-950 border border-slate-900 rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-2 font-inter text-xs text-slate-300 animate-fadeIn">
                {/* Header */}
                <div className="pb-2 border-b border-slate-900">
                  <span className="font-bold text-white block truncate">{session?.user?.name || 'User Profile'}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{session?.user?.email}</span>
                  <span className="inline-block mt-1 text-[9px] font-bold bg-[#6344FF]/20 text-[#6344FF] border border-[#6344FF]/30 px-1.5 py-0.5 rounded uppercase">
                    {plan} Plan
                  </span>
                </div>

                {/* Navigation Options */}
                <Link 
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-900 hover:text-white rounded-lg transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Account Settings</span>
                </Link>

                {plan === 'free' && (
                  <Link 
                    href="/pricing"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 p-2 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 rounded-lg transition font-semibold"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>Upgrade Plan</span>
                  </Link>
                )}

                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition w-full text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links (Icons) */}
          <nav className="flex flex-col gap-2.5 w-full items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <div 
                  key={item.href} 
                  className="relative"
                  onMouseEnter={() => setActiveTooltip(item.name)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <Link
                    href={item.href}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#6344FF]/15 border border-[#6344FF]/30 text-[#6344FF] shadow-[0_0_15px_rgba(99,68,255,0.2)]'
                        : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-[1.2rem] h-[1.2rem]" />
                  </Link>

                  {/* Tooltip */}
                  {activeTooltip === item.name && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility triggers (AI Insights & Settings) */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Sparkles (AI Insights) toggle */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveTooltip('AI Insights')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <button
              onClick={() => setIsInsightsOpen(true)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isInsightsOpen
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'text-rose-500 hover:bg-rose-500/10'
              }`}
            >
              <Sparkles className="w-[1.2rem] h-[1.2rem]" />
            </button>
            {activeTooltip === 'AI Insights' && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                AI Insights
              </div>
            )}
          </div>

          {/* Settings */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveTooltip('Settings')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <Link
              href="/settings"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                pathname === '/settings'
                  ? 'bg-[#6344FF]/15 border border-[#6344FF]/30 text-[#6344FF]'
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Settings className="w-[1.2rem] h-[1.2rem]" />
            </Link>
            {activeTooltip === 'Settings' && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                Settings
              </div>
            )}
          </div>

          {/* Log Out */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveTooltip('Log Out')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <button
              onClick={handleSignOut}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="w-[1.2rem] h-[1.2rem]" />
            </button>
            {activeTooltip === 'Log Out' && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                Log Out
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. AI Insights Drawer Panel (Screenshot 1 overlay) */}
      {isInsightsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsInsightsOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative w-96 h-full bg-[#0d0f17] border-l border-slate-900 p-6 flex flex-col justify-between shadow-2xl z-10 animate-slideIn">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-pink-500 fill-current animate-pulse" />
                  <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 font-figtree">
                    AI Insights
                  </h2>
                </div>
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-inter">
                Auto-generated business suggestions based on real-time data analysis.
              </p>

              {/* Insights List */}
              <div className="space-y-4 font-inter text-xs">
                {insights.map((item, idx) => {
                  const IconComponent = item.icon === 'trending' ? TrendingUp : item.icon === 'shopping' ? ShoppingBag : AlertTriangle;
                  return (
                    <div key={idx} className={`bg-[#141822] border border-slate-900 border-l-4 ${item.color || 'border-l-[#6344FF]'} p-4 rounded-r-xl space-y-2`}>
                      <div className="flex items-center gap-2 text-white font-bold font-figtree">
                        <IconComponent className="w-4 h-4 text-indigo-400" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Generate Button */}
            <div className="pt-4 border-t border-slate-900">
              <button 
                onClick={handleGenerateInsights}
                disabled={generatingInsights}
                className="w-full bg-[#6344FF] hover:bg-[#4f35cf] disabled:bg-slate-800 text-white py-3 rounded-xl font-bold font-figtree transition-all shadow-[0_4px_20px_rgba(99,68,255,0.2)] flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                {generatingInsights ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Generating...
                  </>
                ) : (
                  'Generate New Insights'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide In Animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
}
