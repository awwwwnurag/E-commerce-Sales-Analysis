'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function UpgradeBanner() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);

  const plan = (session?.user as any)?.plan;
  if (plan !== 'free' || dismissed) return null;

  return (
    <div className="upgrade-banner">
      <div className="upgrade-banner-inner">
        <div className="upgrade-icon">⚡</div>
        <div className="upgrade-text">
          <strong>You're on the Free plan</strong>
          <span>Limited to 1 upload · Upgrade to unlock unlimited data, charts & AI insights.</span>
        </div>
        <div className="upgrade-actions">
          <Link href="/pricing" className="upgrade-cta">
            Upgrade Now →
          </Link>
          <button className="upgrade-dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      </div>

      <style jsx>{`
        .upgrade-banner {
          background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(192,132,252,0.1) 100%);
          border-bottom: 1px solid rgba(99,102,241,0.3);
          padding: 0.65rem 1.5rem;
        }
        .upgrade-banner-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'Inter', sans-serif;
        }
        .upgrade-icon { font-size: 1.1rem; flex-shrink: 0; }
        .upgrade-text {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          align-items: baseline;
          flex: 1;
          min-width: 0;
        }
        .upgrade-text strong {
          color: #a5b4fc;
          font-size: 0.875rem;
          white-space: nowrap;
        }
        .upgrade-text span {
          color: #94a3b8;
          font-size: 0.8rem;
        }
        .upgrade-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .upgrade-cta {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(99,102,241,0.35);
        }
        .upgrade-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(99,102,241,0.5);
        }
        .upgrade-dismiss {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.2s;
        }
        .upgrade-dismiss:hover { color: #94a3b8; }
      `}</style>
    </div>
  );
}
