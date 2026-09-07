'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const plans = [
  {
    id: 'free',
    name: 'Free',
    badge: null,
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect to get started and explore the dashboard.',
    features: [
      '1 CSV upload (up to 500 rows)',
      'KPI overview cards',
      'Basic bar & line charts',
      '1 team member',
      'Community support',
    ],
    cta: 'Current Plan',
    disabled: true,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    price: { monthly: 2499, yearly: 1999 },
    description: 'Everything you need to analyse your sales at scale.',
    features: [
      'Unlimited CSV uploads',
      'All dashboard charts & filters',
      'Regional & product analytics',
      'Monthly trend forecasting',
      'AI insight summaries',
      'Up to 10 team members',
      'Email support (48 h SLA)',
    ],
    cta: 'Get Pro',
    disabled: false,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Best Value — Save 20%',
    price: { monthly: 6999, yearly: 5599 },
    description: 'For teams that need power, scale, and priority support.',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom branding & logo',
      'Priority Slack support',
      'Dedicated account manager',
      'Custom data integrations',
      'SOC 2 report on request',
    ],
    cta: 'Get Enterprise',
    disabled: false,
    highlight: false,
  },
];



export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }
    setLoading(planId);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you connected to the internet?');
        setLoading(null);
        return;
      }

      const res = await fetch('/api/razorpay/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: planId, interval: billing }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        setLoading(null);
        return;
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: data.name,
        description: data.description,
        prefill: data.prefill,
        handler: function (response: any) {
          router.push('/dashboard?upgraded=true');
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
          }
        },
        theme: {
          color: '#6366f1',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert('Failed to initiate Razorpay checkout.');
      setLoading(null);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="pricing-root">
      {/* Header */}
      <div className="pricing-header">
        <Link href="/dashboard" className="pricing-back-link">
          ← Back to Dashboard
        </Link>
        <h1 className="pricing-title">Simple, Transparent Pricing</h1>
        <p className="pricing-subtitle">
          Start free — upgrade when you need more power. Cancel anytime.
        </p>

        {/* Billing Toggle */}
        <div className="billing-toggle">
          <span className={billing === 'monthly' ? 'toggle-active' : 'toggle-inactive'}>Monthly</span>
          <button
            className={`toggle-switch ${billing === 'yearly' ? 'toggled' : ''}`}
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
            aria-label="Toggle billing period"
          >
            <span className="toggle-knob" />
          </button>
          <span className={billing === 'yearly' ? 'toggle-active' : 'toggle-inactive'}>
            Yearly
            <span className="save-badge">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="plan-cards">
        {plans.map((plan) => {
          const price =
            billing === 'yearly' ? plan.price.yearly : plan.price.monthly;
          const isLoading = loading === plan.id;

          return (
            <div key={plan.id} className={`plan-card ${plan.highlight ? 'plan-card-highlight' : ''}`}>
              {plan.badge && (
                <div className="plan-badge">{plan.badge}</div>
              )}

              <div className="plan-name">{plan.name}</div>
              <div className="plan-price-row">
                {price === 0 ? (
                  <span className="plan-price">Free</span>
                ) : (
                  <span className="plan-price">
                    {formatPrice(price as number)}
                    <span className="plan-period">/mo</span>
                  </span>
                )}
              </div>
              {billing === 'yearly' && plan.id !== 'free' && (
                <div className="plan-billed-note">
                  Billed {formatPrice((price as number) * 12)}/yr
                </div>
              )}




              <p className="plan-description">{plan.description}</p>

              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f} className="plan-feature">
                    <span className="feature-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`plan-cta ${plan.highlight ? 'plan-cta-primary' : 'plan-cta-secondary'} ${plan.disabled ? 'plan-cta-disabled' : ''}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.disabled || isLoading}
              >
                {isLoading ? 'Redirecting…' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ note */}
      <p className="pricing-footer-note">
        All plans include a 14-day free trial. No credit card required for the Free plan.
        <br />
        Questions? <a href="mailto:support@salesiq.app">Contact support</a>
      </p>

      <style jsx>{`
        .pricing-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1040 50%, #0f1a2e 100%);
          padding: 3rem 1.5rem;
          font-family: 'Inter', sans-serif;
          color: #e2e8f0;
        }
        .pricing-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .pricing-back-link {
          color: #818cf8;
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        .pricing-back-link:hover { color: #a5b4fc; }
        .pricing-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        }
        .pricing-subtitle {
          color: #94a3b8;
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }
        .billing-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 0.5rem 1.25rem;
        }
        .toggle-active { font-weight: 600; color: #e2e8f0; }
        .toggle-inactive { color: #64748b; }
        .toggle-switch {
          width: 44px; height: 24px;
          background: #334155;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.3s;
        }
        .toggle-switch.toggled { background: #6366f1; }
        .toggle-knob {
          position: absolute;
          top: 3px; left: 3px;
          width: 18px; height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .toggled .toggle-knob { transform: translateX(20px); }
        .save-badge {
          margin-left: 0.4rem;
          background: #10b981;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          text-transform: uppercase;
          vertical-align: middle;
        }
        .plan-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto 3rem;
        }
        .plan-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(99,102,241,0.15);
        }
        .plan-card-highlight {
          background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(192,132,252,0.1) 100%);
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1, 0 10px 40px rgba(99,102,241,0.2);
        }
        .plan-badge {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #6366f1, #c084fc);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.85rem;
          border-radius: 0 0 12px 12px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .plan-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          margin-top: 0.75rem;
          color: #f1f5f9;
        }
        .plan-price-row { margin-bottom: 0.25rem; }
        .plan-price {
          font-size: 2.5rem;
          font-weight: 800;
          color: #fff;
        }
        .plan-period {
          font-size: 1rem;
          font-weight: 400;
          color: #64748b;
        }
        .plan-billed-note {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }
        .plan-description {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0.75rem 0 1.25rem;
          line-height: 1.5;
        }
        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .plan-feature {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #cbd5e1;
        }
        .feature-check {
          color: #22c55e;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .plan-cta {
          width: 100%;
          padding: 0.85rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .plan-cta-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(99,102,241,0.4);
        }
        .plan-cta-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99,102,241,0.5);
        }
        .plan-cta-secondary {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .plan-cta-secondary:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
        }
        .plan-cta-disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .pricing-footer-note {
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        .pricing-footer-note a { color: #818cf8; }
      `}</style>
    </div>
  );
}
