import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId, email, name } = session.user as any;
    const { tier, interval } = await req.json(); // tier: 'pro' | 'enterprise', interval: 'monthly' | 'yearly'

    let planId = '';
    if (tier === 'pro') {
      planId = interval === 'yearly'
        ? process.env.RAZORPAY_PRO_YEARLY_PLAN_ID!
        : process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID!;
    } else if (tier === 'enterprise') {
      planId = interval === 'yearly'
        ? process.env.RAZORPAY_ENTERPRISE_YEARLY_PLAN_ID!
        : process.env.RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID!;
    }

    if (!planId) {
      return NextResponse.json({ error: 'Razorpay Plan ID not configured for this tier/interval.' }, { status: 500 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create a subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: interval === 'yearly' ? 5 : 60, // Billed 5 times (years) or 60 times (months)
      quantity: 1,
      notes: {
        companyId,
        plan: tier, // Upgrades company to 'pro' or 'enterprise'
        interval,
        email,
      },
    });


    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: keyId,
      name: 'SalesIQ Analytics',
      description: `${tier.toUpperCase()} ${interval === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
      prefill: {
        name: name || '',
        email: email || '',
      },
    });
  } catch (err: any) {
    console.error('Razorpay error description:', err.error?.description || err.error?.message || err.message);
    console.error('Razorpay error metadata:', err.error?.metadata);
    console.error('Razorpay error status code:', err.statusCode);
    console.error('Razorpay full error payload:', JSON.stringify(err.error || err));
    return NextResponse.json({ error: err.error?.description || err.message || 'Razorpay error' }, { status: 500 });
  }


}
