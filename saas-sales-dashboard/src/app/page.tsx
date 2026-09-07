'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  Sparkles, BarChart3, ShieldCheck, Database, 
  ArrowRight, Users2, Rocket, LineChart, 
  HelpCircle, CreditCard, ChevronRight, Menu, X, 
  Check, MessageSquare, ChevronDown, CheckCircle, Mail, MapPin, Phone, Loader2,
  Trash2, ShieldAlert, CheckSquare, Layers
} from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="landing-root scroll-smooth selection:bg-[#FF4D00] selection:text-white">
      {/* Load Google Fonts for KlipKanvas style (Figtree & Instrument Serif) */}
      <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;700;800;900&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Fixed Background Gradient Image (from klipkanvas.com) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="https://d24yaeywmaqing.cloudfront.net/website-data/images/login/jBUMVVFjKCBRw4l4EEvLSAq3ik4.avif" 
          alt="Background Gradient" 
          className="w-full h-full object-cover scale-110 origin-center opacity-40 blur-[1px]"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* 1. Navbar */}
      <header className="navbar absolute top-0 left-0 right-0 z-50 py-6 px-4 font-figtree">
        <div className="navbar-container max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform overflow-hidden relative">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-3xl font-normal tracking-tighter text-white drop-shadow-md">SalesIQ</span>
          </Link>

          {/* Navigation Links Capsule */}
          <nav className="hidden lg:flex items-center gap-2 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl px-2 py-1.5 shadow-2xl">
            <a href="#hero" className="text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all tracking-tight">Home</a>
            <a href="#features" className="text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all tracking-tight">Features</a>
            <a href="#pricing" className="text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all tracking-tight">Pricing</a>
            <a href="#why-choose-us" className="text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all tracking-tight">About</a>
            <a href="#contact" className="text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all tracking-tight">Contact</a>
          </nav>

          {/* Analyse Button Wrapper */}
          <div className="flex items-center gap-6">
            <Link 
              className="flex items-center bg-black rounded-xl p-1 pr-3 md:pr-4 lg:pr-5 shadow-2xl border border-white/10 group transition-all duration-300 hover:border-white/20 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,68,255,0.4)]" 
              href={session ? "/dashboard" : "/login"}
            >
              <div className="bg-[#6344FF] w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mr-2 md:mr-3 lg:mr-4 transition-all duration-300 group-hover:bg-[#4f35cf]">
                <div className="relative w-3 h-4 flex items-center justify-center will-change-transform transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                  <svg viewBox="0 0 8 10" className="w-full h-full text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="2" height="2"></rect>
                    <rect x="2" y="2" width="2" height="2"></rect>
                    <rect x="4" y="4" width="2" height="2"></rect>
                    <rect x="2" y="6" width="2" height="2"></rect>
                    <rect x="0" y="8" width="2" height="2"></rect>
                  </svg>
                </div>
              </div>
              <span className="text-white font-bold text-xs md:text-xs lg:text-sm uppercase tracking-widest transition-colors duration-300 group-hover:text-indigo-300">Analyse</span>
            </Link>

            {/* Mobile hamburger menu toggle */}
            <button 
              className="lg:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="mobile-menu animate-fadeIn">
            <a href="#hero" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#features" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#why-choose-us" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#contact" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            
            <div className="h-px bg-white/10 my-2" />
            
            {session ? (
              <>
                <Link href="/dashboard" className="mobile-btn-primary" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="mobile-btn-secondary">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="mobile-link font-semibold" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link href="/login?mode=signup" className="mobile-btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <header id="hero" className="hero-section font-figtree">
        <div className="hero-glow" />
        <div className="hero-grid-bg" />
        <div className="hero-container">
          <div className="badge">
            <Sparkles className="w-3.5 h-3.5 text-[rgb(252,156,38)] fill-current" />
            <span>Next-Gen SaaS Sales Intelligence</span>
          </div>

          <h1 className="hero-title">
            Analyze Corporate Sales <br />
            <span className="text-[rgb(252,156,38)] font-serif italic normal-case tracking-normal">Without Code</span>
          </h1>

          <p className="hero-subtitle font-inter">
            Upload custom CSV shapes, auto-map columns dynamically, and render beautiful interactive sales dashboards instantly with secure SOC2 isolation.
          </p>

          <div className="hero-ctas">
            <Link href={session ? "/dashboard" : "/login?mode=signup"} className="btn-hero-primary group">
              Start Analyzing Free
              <ArrowRight className="w-5 h-5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#features" className="btn-hero-secondary">
              Explore Capabilities
            </a>
          </div>
        </div>
      </header>

      {/* 3. Dashboard Preview (Mockup Panel) */}
      <section id="demo" className="demo-section">
        <div className="container">
          <div className="dashboard-mockup font-figtree">
            <div className="mockup-header">
              <div className="dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="address-bar">salesiq.com/dashboard</div>
            </div>
            <div className="mockup-body">
              {/* Fake Sidebar */}
              <div className="sidebar-mock">
                <div className="logo-mock" />
                <div className="nav-item-mock active" />
                <div className="nav-item-mock" />
                <div className="nav-item-mock" />
                <div className="nav-item-mock" />
              </div>
              {/* Fake Main Panel */}
              <div className="content-mock">
                {/* Fake KPI row */}
                <div className="grid-mock">
                  <div className="card-mock relative overflow-hidden bg-white/5 border border-white/5 p-4 rounded-xl">
                    <span className="card-title-mock">Gross Sales</span>
                    <span className="card-val-mock">₹2,84,952.00</span>
                    <div className="spark-line bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full absolute top-3 right-3 font-semibold">+18.4%</div>
                  </div>
                  <div className="card-mock relative overflow-hidden bg-white/5 border border-white/5 p-4 rounded-xl">
                    <span className="card-title-mock">Cost of Goods</span>
                    <span className="card-val-mock">₹73,490.00</span>
                    <div className="spark-line bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-full absolute top-3 right-3 font-semibold">25.7% COGS</div>
                  </div>
                  <div className="card-mock relative overflow-hidden bg-white/5 border border-white/5 p-4 rounded-xl">
                    <span className="card-title-mock">Net Profit</span>
                    <span className="card-val-mock">₹2,11,462.00</span>
                    <div className="spark-line bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] px-1.5 py-0.5 rounded-full absolute top-3 right-3 font-semibold">74.2% Margin</div>
                  </div>
                </div>
                {/* Fake Chart Panel */}
                <div className="chart-mock">
                  <div className="chart-bar-mock" style={{ height: '35%' }} />
                  <div className="chart-bar-mock" style={{ height: '55%' }} />
                  <div className="chart-bar-mock" style={{ height: '45%' }} />
                  <div className="chart-bar-mock" style={{ height: '75%' }} />
                  <div className="chart-bar-mock" style={{ height: '90%' }} />
                  <div className="chart-bar-mock animate-pulse" style={{ height: '65%', background: 'linear-gradient(180deg, #6344FF 0%, rgba(99, 68, 255, 0.1) 100%)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Panorama stats section in KlipKanvas style */}
      <section className="stats-section font-figtree">
        <div className="container">
          <div className="stats-box bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl py-16 px-8 sm:px-12 flex flex-col md:flex-row items-center justify-around overflow-hidden shadow-2xl">
            <div className="flex flex-col items-center text-center py-6 w-full md:w-1/3 group">
              <div className="flex items-baseline justify-center gap-1.5 mb-1 group-hover:scale-105 transition-transform duration-300">
                <span className="text-5xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tighter">500</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[rgb(252,156,38)] font-serif italic ml-1">+</span>
              </div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Active Companies</span>
            </div>
            <div className="hidden md:block w-[1px] h-20 bg-white/10"></div>
            <div className="flex flex-col items-center text-center py-6 w-full md:w-1/3 group">
              <div className="flex items-baseline justify-center gap-1.5 mb-1 group-hover:scale-105 transition-transform duration-300">
                <span className="text-5xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tighter">12</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[rgb(252,156,38)] font-serif italic ml-1">M+</span>
              </div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Rows Ingested</span>
            </div>
            <div className="hidden md:block w-[1px] h-20 bg-white/10"></div>
            <div className="flex flex-col items-center text-center py-6 w-full md:w-1/3 group">
              <div className="flex items-baseline justify-center gap-1.5 mb-1 group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[rgb(252,156,38)] font-serif italic mr-1">₹</span>
                <span className="text-5xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tighter">98</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[rgb(252,156,38)] font-serif italic ml-1">Cr+</span>
              </div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sales Audited</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section (Bento Grid Layout) */}
      <section id="features" className="features-section font-figtree">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Capabilities</div>
            <h2 className="section-title">The Bento of <span className="text-[rgb(252,156,38)] font-serif italic normal-case tracking-normal">Intelligence</span></h2>
            <p className="section-subtitle font-inter">See how your business metrics compile automatically using our high-converting bento data modules.</p>
          </div>

          <div className="bento-grid font-inter">
            
            {/* Bento Card 1: Col span 2 (Synonyms Auto-Mapper) */}
            <div className="bento-card col-span-2 flex flex-col md:flex-row justify-between gap-6 overflow-hidden">
              <div className="flex-1 flex flex-col justify-between">
                <div className="feature-icon-wrapper">
                  <Database className="feature-icon" />
                </div>
                <div>
                  <h3 className="feature-title font-figtree">Synonyms Auto-Mapper</h3>
                  <p className="feature-description">
                    Upload raw spreadsheets. Our engine matches columns like MRP to Cost, Outlet to Customer, or Weight to Quantity automatically.
                  </p>
                </div>
              </div>
              <div className="bento-visual flex flex-col gap-2 justify-center bg-black/40 border border-white/5 p-4 rounded-xl min-w-[200px] shrink-0 font-mono text-[10px]">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/40">CSV Header</span>
                  <span className="text-white/40">Mapped field</span>
                </div>
                <div className="flex justify-between items-center bg-[#6344FF]/10 p-2 rounded-lg border border-[#6344FF]/25 text-white">
                  <span>Item_MRP</span>
                  <span className="text-indigo-400 font-bold">➔ Cost</span>
                </div>
                <div className="flex justify-between items-center bg-[rgb(252,156,38)]/10 p-2 rounded-lg border border-[rgb(252,156,38)]/25 text-white">
                  <span>Outlet_ID</span>
                  <span className="text-[rgb(252,156,38)] font-bold">➔ Customer</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Col span 1 (Tenant Data Security) */}
            <div className="bento-card col-span-1 flex flex-col justify-between">
              <div className="feature-icon-wrapper">
                <ShieldCheck className="feature-icon" />
              </div>
              <div>
                <h3 className="feature-title font-figtree">SOC2 Isolation</h3>
                <p className="feature-description">
                  SOC2 isolation protocols guarantee your business records remain partitioned and private to your workspace.
                </p>
              </div>
            </div>

            {/* Bento Card 3: Col span 1 (Roster Hub) */}
            <div className="bento-card col-span-1 flex flex-col justify-between">
              <div className="feature-icon-wrapper">
                <Users2 className="feature-icon" />
              </div>
              <div>
                <h3 className="feature-title font-figtree">Teammates Roster</h3>
                <p className="feature-description">
                  Invite colleagues with Viewer, Analyst, or Admin roles to split editing capabilities and dashboard filters.
                </p>
              </div>
            </div>

            {/* Bento Card 4: Col span 2 (High-Fidelity Visuals) */}
            <div className="bento-card col-span-2 flex flex-col md:flex-row justify-between gap-6 overflow-hidden">
              <div className="flex-1 flex flex-col justify-between">
                <div className="feature-icon-wrapper">
                  <BarChart3 className="feature-icon" />
                </div>
                <div>
                  <h3 className="feature-title font-figtree">High-Fidelity Visuals</h3>
                  <p className="feature-description">
                    Instant charts, line graphs, and metrics trackers. Slice data distributions by location, dates, or product categories.
                  </p>
                </div>
              </div>
              <div className="bento-visual flex items-end justify-around bg-black/40 border border-white/5 p-6 rounded-xl min-w-[200px] h-[130px] shrink-0 gap-3">
                <div className="w-5 bg-[#6344FF] rounded-t-sm" style={{ height: '40%' }} />
                <div className="w-5 bg-[rgb(252,156,38)] rounded-t-sm" style={{ height: '70%' }} />
                <div className="w-5 bg-[#6344FF] rounded-t-sm" style={{ height: '55%' }} />
                <div className="w-5 bg-[rgb(252,156,38)] rounded-t-sm" style={{ height: '90%' }} />
              </div>
            </div>

            {/* Bento Card 5: Col span 2 (Growth Forecasts) */}
            <div className="bento-card col-span-2 flex flex-col md:flex-row justify-between gap-6 overflow-hidden">
              <div className="flex-1 flex flex-col justify-between">
                <div className="feature-icon-wrapper">
                  <LineChart className="feature-icon" />
                </div>
                <div>
                  <h3 className="feature-title font-figtree">Growth Trends</h3>
                  <p className="feature-description">
                    Visualize monthly trends and segment breakdowns to track profit margins and predict inventory demands cleanly.
                  </p>
                </div>
              </div>
              <div className="bento-visual flex flex-col gap-2 justify-center bg-black/40 border border-white/5 p-4 rounded-xl min-w-[200px] shrink-0 font-mono text-[9px] text-white/60">
                <div className="flex justify-between">
                  <span>Gross Sales</span>
                  <span className="text-white font-bold">₹2,84,952</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Margins</span>
                  <span className="text-emerald-400 font-bold">74.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Outlets</span>
                  <span className="text-indigo-400 font-bold">12 Stores</span>
                </div>
              </div>
            </div>

            {/* Bento Card 6: Col span 1 (Asynchronous Purges) */}
            <div className="bento-card col-span-1 flex flex-col justify-between">
              <div className="feature-icon-wrapper">
                <Rocket className="feature-icon" />
              </div>
              <div>
                <h3 className="feature-title font-figtree">Cascade Purges</h3>
                <p className="feature-description">
                  Delete any dataset upload log, and its corresponding sales records will clear completely via secure database operations.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Why Choose Us Section */}
      <section id="why-choose-us" className="why-choose-us-section font-figtree">
        <div className="container">
          <div className="grid-split">
            <div className="why-left">
              <div className="section-badge">Why Choose Us</div>
              <h2 className="section-title text-left">Clean analytical execution <br/><span className="text-[rgb(252,156,38)] font-serif italic normal-case tracking-normal">without filming</span></h2>
              <p className="text-white/60 mb-8 text-sm leading-relaxed font-inter">
                Stop managing complex pipelines. SalesIQ provides a SOC2-secured sandbox that parses, formats, and structures sales data records out-of-the-box.
              </p>

              <ul className="why-list font-inter">
                <li>
                  <CheckCircle className="why-list-icon" />
                  <div>
                    <span className="font-bold text-white block">Synonym mapping dictionaries</span>
                    <p className="text-xs text-white/50 mt-0.5">Saves hours of manually rewriting column headers for each file shape.</p>
                  </div>
                </li>
                <li>
                  <CheckCircle className="why-list-icon" />
                  <div>
                    <span className="font-bold text-white block">Fault-Tolerant parsing fallbacks</span>
                    <p className="text-xs text-white/50 mt-0.5">Empty cells are automatically mapped to default parameters instead of failing.</p>
                  </div>
                </li>
                <li>
                  <CheckCircle className="why-list-icon" />
                  <div>
                    <span className="font-bold text-white block">Permanent Cascade purges</span>
                    <p className="text-xs text-white/50 mt-0.5">Delete data records immediately from your workspace settings page.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="why-right">
              <div className="accent-banner bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                <div className="accent-glow" />
                <h4 className="text-lg font-bold text-white mb-2">SOC2 Tenancy Segment</h4>
                <p className="text-xs text-white/60 mb-6 font-inter leading-relaxed">
                  Your business uploads are strictly sandboxed using index-level segmentation keys. Encrypted and protected at rest.
                </p>
                <div className="p-4 bg-black/60 border border-white/5 rounded-xl space-y-2.5">
                  <div className="flex justify-between text-[10px] font-bold tracking-widest text-white/40">
                    <span>DATABASE INTEGRITY</span>
                    <span className="text-emerald-400">100% HEALTHY</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="pricing-section font-figtree">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Affordable Pricing</div>
            <h2 className="section-title">Simple, transparent <span className="text-[rgb(252,156,38)] font-serif italic normal-case tracking-normal">pricing</span></h2>
            <p className="section-subtitle font-inter">Start free — upgrade when you need more power. Cancel anytime.</p>

            {/* Toggle switch */}
            <div className="pricing-toggle-container">
              <span className={`toggle-label ${billingInterval === 'monthly' ? 'active' : ''}`}>Monthly</span>
              <button 
                className="toggle-button"
                onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                aria-label="Toggle billing interval"
              >
                <span className={`toggle-dot ${billingInterval === 'yearly' ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`toggle-label ${billingInterval === 'yearly' ? 'active' : ''}`}>
                Yearly <span className="save-badge">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="pricing-grid font-inter">
            {/* Free Plan Card */}
            <div className="pricing-card bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col hover:border-white/10 transition-all animate-fadeIn">
              <h3 className="pricing-tier-title font-figtree">Free</h3>
              <p className="pricing-tier-desc">Perfect to get started and explore the dashboard.</p>
              
              <div className="pricing-price-container">
                <span className="price-amount text-white">Free</span>
              </div>
              <p className="billing-billed-text opacity-0 select-none">No cost forever</p>

              <ul className="pricing-features">
                <li><Check className="price-icon" /> 1 CSV upload (up to 500 rows)</li>
                <li><Check className="price-icon" /> KPI overview cards</li>
                <li><Check className="price-icon" /> Basic bar & line charts</li>
                <li><Check className="price-icon" /> 1 team member</li>
                <li><Check className="price-icon" /> Community support</li>
              </ul>

              <Link href="/pricing" className="pricing-cta-button hover:bg-white/5 font-figtree">
                Get Started
              </Link>
            </div>

            {/* Pro Plan Card - Highlighted (Popular) */}
            <div className="pricing-card premium bg-[#6344FF]/5 border border-[#6344FF]/30 rounded-3xl p-8 flex flex-col shadow-2xl shadow-[#6344FF]/10 hover:border-[#6344FF]/50 transition-all relative">
              <div className="premium-badge bg-[#6344FF]">Most Popular</div>
              <h3 className="pricing-tier-title font-figtree">Pro</h3>
              <p className="pricing-tier-desc">Everything you need to analyse your sales at scale.</p>
              
              <div className="pricing-price-container">
                <span className="price-symbol text-[rgb(252,156,38)]">₹</span>
                <span className="price-amount">
                  {billingInterval === 'monthly' ? '2,499' : '1,999'}
                </span>
                <span className="price-period">/ month</span>
              </div>
              {billingInterval === 'yearly' ? (
                <p className="billing-billed-text">Billed yearly (₹23,988)</p>
              ) : (
                <p className="billing-billed-text opacity-0 select-none">Billed monthly</p>
              )}

              <ul className="pricing-features">
                <li><Check className="price-icon text-indigo-400" /> Unlimited CSV uploads</li>
                <li><Check className="price-icon text-indigo-400" /> All dashboard charts & filters</li>
                <li><Check className="price-icon text-indigo-400" /> Regional & product analytics</li>
                <li><Check className="price-icon text-indigo-400" /> Monthly trend forecasting</li>
                <li><Check className="price-icon text-indigo-400" /> AI insight summaries</li>
                <li><Check className="price-icon text-indigo-400" /> Up to 10 team members</li>
                <li><Check className="price-icon text-indigo-400" /> Email support (48 h SLA)</li>
              </ul>

              <Link href="/pricing" className="pricing-cta-button premium bg-[#6344FF] hover:bg-[#4f35cf] border-transparent text-white font-figtree">
                Get Pro
              </Link>
            </div>

            {/* Enterprise Plan Card */}
            <div className="pricing-card bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col hover:border-white/10 transition-all relative">
              <div className="premium-badge bg-black/60 border border-white/10 text-white/90">Best Value</div>
              <h3 className="pricing-tier-title font-figtree">Enterprise</h3>
              <p className="pricing-tier-desc">For teams that need power, scale, and priority support.</p>

              <div className="pricing-price-container">
                <span className="price-symbol text-[rgb(252,156,38)]">₹</span>
                <span className="price-amount">
                  {billingInterval === 'monthly' ? '6,999' : '5,599'}
                </span>
                <span className="price-period">/ month</span>
              </div>
              {billingInterval === 'yearly' ? (
                <p className="billing-billed-text text-[#ec4899]">Billed yearly (₹67,188)</p>
              ) : (
                <p className="billing-billed-text opacity-0 select-none">Billed monthly</p>
              )}

              <ul className="pricing-features">
                <li><Check className="price-icon" /> Everything in Pro</li>
                <li><Check className="price-icon" /> Unlimited team members</li>
                <li><Check className="price-icon" /> Custom branding & logo</li>
                <li><Check className="price-icon" /> Priority Slack support</li>
                <li><Check className="price-icon" /> Dedicated account manager</li>
                <li><Check className="price-icon" /> Custom data integrations</li>
                <li><Check className="price-icon" /> SOC 2 report on request</li>
              </ul>

              <Link href="/pricing" className="pricing-cta-button hover:bg-white/5 font-figtree">
                Get Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials Section */}
      <section id="testimonials" className="testimonials-section font-figtree">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Testimonials</div>
            <h2 className="section-title">The Panorama of <span className="text-[rgb(252,156,38)] font-serif italic normal-case tracking-normal">Success</span></h2>
            <p className="section-subtitle font-inter">See how corporate analysts and brand founders are scaling their analytics output.</p>
          </div>

          <div className="testimonials-grid font-inter">
            <div className="testimonial-card">
              <p className="testimonial-comment">
                "SalesIQ resolved our data matching bottlenecks overnight. We imported multi-store datasets containing irregular headers, and the auto-mapper resolved types flawlessly. Deleting old logs to clear out dashboard graphs is incredibly fast."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar bg-gradient-to-r from-pink-500 to-indigo-500" />
                <div>
                  <span className="author-name">Rajesh Iyer</span>
                  <span className="author-title">Retail Analytics Lead, MartCorp</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-comment">
                "I was skeptical about a zero-SQL dashboard, but the filters are remarkably quick. The multi-tenant security guarantees our franchise owners only see their branch statistics. Fantastic interface."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar bg-gradient-to-r from-purple-500 to-amber-500" />
                <div>
                  <span className="author-name">Neha Sharma</span>
                  <span className="author-title">Operations Director, FreshFoods</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-comment">
                "The pricing in INR is highly convenient, and integrating the dashboard took exactly 2 minutes. The fault-tolerant parser makes importing files with empty cells absolute child's play."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar bg-gradient-to-r from-emerald-500 to-indigo-500" />
                <div>
                  <span className="author-name">Vikram Malhotra</span>
                  <span className="author-title">Co-Founder, BevZone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="faq-section font-figtree">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">FAQ</div>
            <h2 className="section-title">Frequently Asked <span className="text-[rgb(252,156,38)] font-serif italic normal-case tracking-normal">Questions</span></h2>
            <p className="section-subtitle font-inter">Clear answers to typical queries concerning schemas, security, and CSV capabilities.</p>
          </div>

          <div className="faq-accordion-list font-inter">
            {[
              {
                q: "What headers does the CSV upload require?",
                a: "The uploader requires only three main properties: Date, Product Name, and Sales/Revenue. All other columns (like Cost, Quantity, Customer Name, and Region) are completely optional and can be skipped on the mapping screen."
              },
              {
                q: "How does the column auto-guessing synonym mapping work?",
                a: "When you drag a file, our parser checks for standard keywords like MRP, spending, weight, qty, buyer, or city and pairs them with internal data structures automatically so you don't have to assign them manually every time."
              },
              {
                q: "What happens when I delete an uploaded CSV file?",
                a: "Deleting an upload performs a secure cascade operation. It removes the CSV record log and instantly purges all related rows from the database. The dashboard will automatically update to reflect the change."
              },
              {
                q: "Is my business data shared with other companies?",
                a: "Never. SalesIQ implements multi-tenant isolation. All queries check the user's specific company ID, ensuring records are strictly partitioned and completely secure."
              }
            ].map((item, index) => (
              <div key={index} className="faq-item bg-white/5 border border-white/5 rounded-xl">
                <button className="faq-trigger" onClick={() => toggleFaq(index)}>
                  <span className="faq-question font-figtree">{item.q}</span>
                  <ChevronDown className={`faq-arrow ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === index && (
                  <div className="faq-content">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Contact Section */}
      <section id="contact" className="contact-section font-figtree">
        <div className="container">
          <div className="grid-split">
            <div className="contact-left">
              <div className="section-badge">Get In Touch</div>
              <h2 className="section-title text-left">Connect with <br/><span className="text-[rgb(252,156,38)] font-serif italic normal-case tracking-normal">our team</span></h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8 font-inter">
                Have questions about custom CRM integration, SOC2 compliance reports, or high-volume enterprise data schemas? Write us a message, and our engineering team will get back to you shortly.
              </p>

              <div className="contact-details font-inter">
                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <Mail className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-xs block">Email Us</span>
                    <span className="text-slate-400 text-xs">support@salesiq.com</span>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <Phone className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-xs block">Call Us</span>
                    <span className="text-slate-400 text-xs">+91 (800) 123-4567</span>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-xs block">Our Office</span>
                    <span className="text-slate-400 text-xs">Pune, Maharashtra, India</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-right font-inter">
              {formSubmitted ? (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white font-figtree">Message Received!</h3>
                  <p className="text-xs text-slate-400">
                    Thank you for reaching out. A support engineer will reply to your registered email address shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="bg-white/5 border border-white/5 rounded-2xl p-8 space-y-4">
                  <h3 className="text-base font-bold text-white font-figtree">Submit an Inquiry</h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Your Message</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Tell us about your database shape or enterprise support needs..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="w-full bg-[#6344FF] hover:bg-[#4f35cf] text-white rounded-xl py-2.5 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(99,68,255,0.3)] font-figtree"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="footer font-figtree">
        <div className="footer-container">
          <div>
            <div className="footer-logo mb-2">
              <Sparkles className="logo-icon" />
              <span className="logo-text">SalesIQ</span>
            </div>
            <p className="text-slate-500 text-xs max-w-xs font-inter">
              Next-generation multi-tenant sales analytical aggregator dashboard built with Next.js and MongoDB.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <span className="column-title">Product</span>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Preview</a>
            </div>
            <div className="footer-links-column">
              <span className="column-title">Company</span>
              <a href="#why-choose-us">About</a>
              <a href="#contact">Contact</a>
              <Link href="/pricing">Plans</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright font-inter">
            &copy; {new Date().getFullYear()} SalesIQ Inc. All rights reserved. Created with high-converting glassmorphic frameworks.
          </p>
        </div>
      </footer>

      {/* Landing Page Styling */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .landing-root {
          background-color: #000000;
          color: #f4f4f5;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          overflow-x: hidden;
        }
        
        /* Navbar */
        .navbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: transparent;
          border-bottom: none;
        }
        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
        }
        .logo-badge {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .logo-section:hover .logo-badge {
          transform: scale(1.1);
        }
        .logo-icon {
          color: #ffffff;
          width: 1.25rem;
          height: 1.25rem;
        }
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.05em;
        }
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          padding: 0.25rem 0.5rem 0.25rem 1.5rem;
        }
        .nav-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          padding: 0.5rem 0.8rem;
          border-radius: 0.75rem;
        }
        .nav-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        .nav-divider {
          width: 1px;
          height: 1rem;
          background-color: rgba(255, 255, 255, 0.1);
          margin: 0 0.5rem;
        }
        .nav-btn-primary {
          background-color: #6344FF;
          color: #ffffff;
          padding: 0.5rem 1.25rem;
          border-radius: 0.75rem;
          text-decoration: none;
          font-size: 0.825rem;
          font-weight: 700;
          transition: background 0.2s, shadow 0.2s;
          shadow: 0 4px 12px rgba(99, 68, 255, 0.3);
        }
        .nav-btn-primary:hover {
          background-color: #4f35cf;
        }
        .nav-btn-secondary {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.5rem 1.25rem;
          border-radius: 0.75rem;
          font-size: 0.825rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          margin-left: 0.5rem;
        }
        .nav-btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .mobile-toggle {
          display: none;
          color: #ffffff;
          background: none;
          border: none;
          cursor: pointer;
        }

        /* Hero */
        .hero-section {
          position: relative;
          padding: 10rem 2rem 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .hero-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 75vw;
          height: 45vh;
          background: radial-gradient(circle, rgba(99, 68, 255, 0.18) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .hero-container {
          max-width: 900px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          padding: 0.45rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.775rem;
          font-weight: 700;
          margin-bottom: 2.5rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .hero-title {
          font-size: 5rem;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: #ffffff;
          margin-bottom: 2rem;
        }
        .hero-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.2rem;
          line-height: 1.6;
          max-width: 650px;
          margin-bottom: 3.5rem;
        }
        .hero-ctas {
          display: flex;
          gap: 1.25rem;
        }
        .btn-hero-primary {
          background-color: #6344FF;
          color: #ffffff;
          padding: 1rem 2rem;
          border-radius: 0.85rem;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          transition: background 0.2s, transform 0.2s;
          box-shadow: 0 8px 25px rgba(99, 68, 255, 0.35);
        }
        .btn-hero-primary:hover {
          background-color: #4f35cf;
          transform: translateY(-1px);
        }
        .btn-hero-secondary {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          padding: 1rem 2rem;
          border-radius: 0.85rem;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          transition: background 0.2s, border 0.2s;
        }
        .btn-hero-secondary:hover {
          background-color: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* Mockup Preview Section */
        .demo-section {
          padding: 2rem 2rem 6rem;
          display: flex;
          justify-content: center;
        }
        .dashboard-mockup {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          background-color: #000000;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 30px 70px -10px rgba(0, 0, 0, 0.8);
        }
        .mockup-header {
          background-color: #09090b;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .dots {
          display: flex;
          gap: 0.45rem;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot-red { background-color: #ff5f56; }
        .dot-yellow { background-color: #ffbd2e; }
        .dot-green { background-color: #27c93f; }
        .address-bar {
          margin: 0 auto;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.75rem;
          padding: 0.25rem 2.5rem;
          border-radius: 0.35rem;
          font-family: monospace;
        }
        .mockup-body {
          display: flex;
          height: 380px;
        }
        .sidebar-mock {
          width: 70px;
          background-color: #050505;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.75rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }
        .logo-mock {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6344FF, rgb(252,156,38));
          margin-bottom: 1rem;
        }
        .nav-item-mock {
          width: 30px;
          height: 30px;
          border-radius: 0.5rem;
          background-color: rgba(255, 255, 255, 0.02);
        }
        .nav-item-mock.active {
          background-color: rgba(99, 68, 255, 0.15);
          border: 1px solid rgba(99, 68, 255, 0.35);
        }
        .content-mock {
          flex: 1;
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
        }
        .grid-mock {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .card-mock {
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 1.25rem;
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
        }
        .card-title-mock {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .card-val-mock {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
        }
        .chart-mock {
          flex: 1;
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 0.75rem;
          padding: 2rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          gap: 1.5rem;
        }
        .chart-bar-mock {
          flex: 1;
          max-width: 55px;
          border-radius: 0.35rem 0.35rem 0 0;
          background: linear-gradient(180deg, #6344FF 0%, rgba(99, 68, 255, 0.05) 100%);
        }

        /* Stats Box Section */
        .stats-section {
          padding: 2rem 2rem 5rem;
        }
        .stats-box {
          background-color: rgba(255, 255, 255, 0.02);
        }

        /* Features Section */
        .features-section {
          padding: 7rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          background: radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 10;
        }
        .section-header {
          text-align: center;
          margin-bottom: 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .section-badge {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
          width: fit-content;
        }
        
        /* Features emerald green style */
        .features-section .section-badge {
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.3);
          background-color: rgba(16, 185, 129, 0.05);
        }
        .section-title {
          font-size: 3rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }
        .section-subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        /* Bento Grid Placement */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .bento-card {
          background-color: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 2.25rem;
          border-radius: 1.5rem;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 12px 30px -10px rgba(16, 185, 129, 0.15);
        }
        .bento-card.col-span-2 {
          grid-column: span 2;
        }
        .bento-card.col-span-1 {
          grid-column: span 1;
        }
        
        .feature-icon-wrapper {
          width: 3.25rem;
          height: 3.25rem;
          border-radius: 0.75rem;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.75rem;
        }
        .features-section .feature-icon {
          color: #10b981;
          width: 1.5rem;
          height: 1.5rem;
        }
        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }
        .feature-description {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        /* Why Choose Us Section - Cyan accents */
        .why-choose-us-section {
          padding: 8rem 2rem;
          background: radial-gradient(circle at center, rgba(6, 182, 212, 0.08) 0%, transparent 60%);
          border-top: 1px solid rgba(255, 255, 255, 0.02);
        }
        .why-choose-us-section .section-badge {
          color: #06b6d4;
          border-color: rgba(6, 182, 212, 0.3);
          background-color: rgba(6, 182, 212, 0.05);
        }
        .grid-split {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 5rem;
          align-items: center;
          position: relative;
          z-index: 10;
        }
        .why-list {
          list-style: none;
          padding: 0;
          margin: 2rem 0 0;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .why-list li {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .why-list-icon {
          color: #06b6d4;
          width: 1.25rem;
          height: 1.25rem;
          margin-top: 0.15rem;
          flex-shrink: 0;
        }
        .why-right {
          position: relative;
        }
        .accent-banner {
          background-color: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 3rem;
          border-radius: 1.5rem;
          overflow: hidden;
          position: relative;
          box-shadow: 0 25px 50px -15px rgba(0, 0, 0, 0.8);
        }
        .accent-glow {
          position: absolute;
          top: -20%;
          right: -20%;
          width: 180px;
          height: 180px;
          background-color: rgba(6, 182, 212, 0.1);
          filter: blur(45px);
          border-radius: 50%;
        }

        /* Pricing Section - Magenta / Purple accents */
        .pricing-section {
          padding: 8rem 2rem;
          background: radial-gradient(circle at center, rgba(236, 72, 153, 0.08) 0%, transparent 60%);
          border-top: 1px solid rgba(255, 255, 255, 0.02);
        }
        .pricing-section .section-badge {
          color: #ec4899;
          border-color: rgba(236, 72, 153, 0.3);
          background-color: rgba(236, 72, 153, 0.05);
        }
        .pricing-toggle-container {
          display: inline-flex;
          align-items: center;
          gap: 1.25rem;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          margin-top: 2.5rem;
        }
        .toggle-label {
          font-size: 0.825rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.2s;
        }
        .toggle-label.active {
          color: #ffffff;
        }
        .toggle-button {
          width: 3.5rem;
          height: 1.65rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.06);
          border: none;
          position: relative;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .toggle-dot {
          width: 1.15rem;
          height: 1.15rem;
          border-radius: 50%;
          background-color: #ffffff;
          position: absolute;
          left: 0.25rem;
          transition: transform 0.2s;
        }
        .save-badge {
          background-color: rgba(236, 72, 153, 0.1);
          color: #ec4899;
          border: 1px solid rgba(236, 72, 153, 0.2);
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.65rem;
          font-weight: 700;
          margin-left: 0.25rem;
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 5rem auto 0;
        }
        .pricing-card {
          background-color: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.5rem;
          padding: 3rem;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s, border-color 0.3s;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          border-color: rgba(236, 72, 153, 0.4);
          box-shadow: 0 12px 30px -10px rgba(236, 72, 153, 0.15);
        }
        .pricing-card.premium {
          border-color: rgba(99, 68, 255, 0.4);
          background-color: rgba(99, 68, 255, 0.02);
        }
        .pricing-card.premium:hover {
          border-color: rgba(99, 68, 255, 0.6);
          box-shadow: 0 12px 30px -10px rgba(99, 68, 255, 0.25);
        }
        .premium-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.75rem;
          background-color: #6344FF;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pricing-tier-title {
          font-size: 1.6rem;
          font-weight: 850;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }
        .pricing-tier-desc {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.875rem;
          margin-bottom: 2.25rem;
          line-height: 1.5;
        }
        .pricing-price-container {
          display: flex;
          align-items: baseline;
          margin-bottom: 0.5rem;
        }
        .price-symbol {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin-right: 0.25rem;
        }
        .price-amount {
          font-size: 3.75rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.03em;
        }
        .price-period {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.95rem;
          margin-left: 0.25rem;
        }
        .billing-billed-text {
          color: rgb(252, 156, 38);
          font-size: 0.775rem;
          font-weight: 700;
          margin-bottom: 2.25rem;
        }
        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .pricing-features li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .price-icon {
          color: #ec4899;
          width: 1.25rem;
          height: 1.25rem;
        }
        .pricing-card.premium .price-icon {
          color: #6344FF;
        }
        .pricing-cta-button {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          text-align: center;
          padding: 0.9rem;
          border-radius: 0.85rem;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          transition: background 0.2s, border 0.2s;
          margin-top: auto;
        }
        .pricing-cta-button:hover {
          background-color: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* Testimonials Section - Rose accents */
        .testimonials-section {
          padding: 8rem 2rem;
          background: radial-gradient(circle at center, rgba(244, 63, 94, 0.08) 0%, transparent 60%);
          border-top: 1px solid rgba(255, 255, 255, 0.02);
        }
        .testimonials-section .section-badge {
          color: #f43f5e;
          border-color: rgba(244, 63, 94, 0.3);
          background-color: rgba(244, 63, 94, 0.05);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
          margin-top: 4.5rem;
        }
        .testimonial-card {
          background-color: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 2.75rem;
          border-radius: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .testimonial-card:hover {
          border-color: rgba(244, 63, 94, 0.4);
          box-shadow: 0 12px 30px -10px rgba(244, 63, 94, 0.15);
        }
        .testimonial-comment {
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          font-style: italic;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .author-avatar {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
        }
        .author-name {
          font-weight: 700;
          color: #ffffff;
          font-size: 0.875rem;
          display: block;
        }
        .author-title {
          font-size: 0.725rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.15rem;
          display: block;
        }

        /* FAQ Section - Blue accents */
        .faq-section {
          padding: 8rem 2rem;
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
          border-top: 1px solid rgba(255, 255, 255, 0.02);
        }
        .faq-section .section-badge {
          color: #3b82f6;
          border-color: rgba(59, 130, 246, 0.3);
          background-color: rgba(59, 130, 246, 0.05);
        }
        .faq-accordion-list {
          max-width: 750px;
          margin: 4.5rem auto 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .faq-item {
          background-color: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 0.85rem;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .faq-item:hover {
          border-color: rgba(59, 130, 246, 0.4);
        }
        .faq-trigger {
          width: 100%;
          background: none;
          border: none;
          padding: 1.65rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          color: #ffffff;
          text-align: left;
        }
        .faq-question {
          font-weight: 700;
          font-size: 1rem;
          padding-right: 1.5rem;
        }
        .faq-arrow {
          color: rgba(255, 255, 255, 0.4);
          width: 1.2rem;
          height: 1.2rem;
          transition: transform 0.25s;
          flex-shrink: 0;
        }
        .faq-content {
          padding: 0 1.65rem 1.65rem;
          border-top: 1px solid rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          line-height: 1.6;
          animation: slideDown 0.25s ease-out;
        }

        /* Contact Section - Gold / Orange accents */
        .contact-section {
          padding: 8rem 2rem;
          background: radial-gradient(circle at center, rgba(252, 156, 38, 0.08) 0%, transparent 60%);
          border-top: 1px solid rgba(255, 255, 255, 0.02);
        }
        .contact-section .section-badge {
          color: rgb(252, 156, 38);
          border-color: rgba(252, 156, 38, 0.3);
          background-color: rgba(252, 156, 38, 0.05);
        }
        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .contact-detail-item {
          display: flex;
          align-items: center;
          gap: 1.15rem;
        }
        .contact-detail-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.65rem;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0.55rem;
        }

        /* Footer */
        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding: 5.5rem 2rem 2.5rem;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 4rem;
          margin-bottom: 4rem;
        }
        .footer-links {
          display: flex;
          gap: 6rem;
        }
        .footer-links-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .column-title {
          font-size: 0.725rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #ffffff;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .footer-links-column a {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          font-size: 0.825rem;
          transition: color 0.2s;
        }
        .footer-links-column a:hover {
          color: #ffffff;
        }
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid rgba(255, 255, 255, 0.02);
          padding-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-copyright {
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.775rem;
        }

        /* Animations & Utilities */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce 3.5s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Responsive Styles */
        @media (max-width: 900px) {
          .nav-links-desktop { display: none; }
          .mobile-toggle { display: block; }
          .hero-title { font-size: 3rem; }
          .grid-split { grid-template-columns: 1fr; gap: 4rem; }
          .bento-grid { grid-template-columns: 1fr; }
          .bento-card.col-span-2 { grid-column: span 1; }
          .bento-card { flex-direction: column !important; }
          .testimonials-grid { grid-template-columns: 1fr; max-width: 480px; margin: 3.5rem auto 0; }
          .footer-container { flex-direction: column; gap: 3rem; }
          
          .mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            background-color: #000000;
            padding: 2.25rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .mobile-link {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            font-size: 1.05rem;
            font-weight: 500;
          }
          .mobile-btn-primary {
            background-color: #6344FF;
            color: #ffffff;
            text-align: center;
            padding: 0.8rem;
            border-radius: 0.75rem;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(99, 68, 255, 0.25);
          }
          .mobile-btn-secondary {
            background: none;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 0.8rem;
            border-radius: 0.75rem;
            font-weight: 700;
            cursor: pointer;
            font-size: 0.9rem;
          }
        }
        @media (max-width: 600px) {
          .hero-ctas { flex-direction: column; width: 100%; }
          .btn-hero-primary, .btn-hero-secondary { text-align: center; justify-content: center; }
          .mockup-body { height: 260px; }
          .grid-mock { grid-template-columns: 1fr; }
          .card-mock:nth-child(n+2) { display: none; } /* Hide extra cards on mobile mockup */
          .pricing-grid { grid-template-columns: 1fr; max-width: 480px; }
        }
      `}</style>
    </div>
  );
}
