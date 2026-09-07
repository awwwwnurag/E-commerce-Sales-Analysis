import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/utils/mongodb';
import { Company } from '@/models/Company';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured.');
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('Invalid Razorpay signature received.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log('Razorpay webhook event received:', event.event);

    // Handle subscription charging or activation events
    if (event.event === 'subscription.charged' || event.event === 'subscription.activated') {
      const subscription = event.payload.subscription.entity;
      const { companyId, plan } = subscription.notes ?? {};

      if (companyId && plan) {
        await connectDB();
        await Company.findByIdAndUpdate(companyId, {
          plan,
          stripeCustomerId: undefined, // Clear out Stripe field if it exists
          subscriptionId: subscription.id,
        });
        console.log(`Successfully upgraded Company ${companyId} to ${plan} via Razorpay subscription ${subscription.id}`);
      } else {
        console.warn('Subscription notes missing companyId or plan.', subscription.notes);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Razorpay webhook handler error:', err);
    return NextResponse.json({ error: err.message || 'Webhook error' }, { status: 500 });
  }
}
