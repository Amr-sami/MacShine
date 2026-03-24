import { NextResponse } from 'next/server';
import { generateLicenseKey } from '@/lib/license';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    // In production, we would use Paddle's webhook signature verification here
    // import { Environment, Paddle } from '@paddle/paddle-js';

    const event = JSON.parse(rawBody);

    if (event.event_type === 'subscription.created' || event.event_type === 'subscription.updated') {
      const customerId = event.data.customer_id || 'mock_customer';
      const email = event.data.custom_data?.email || 'customer@example.com';
      
      // Calculate expiry (1 year for Pro)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const newLicenseKey = await generateLicenseKey(customerId, 'pro', email, expiresAt);

      // In production, this saves the license to Supabase and sends an email via Resend
      console.log(`[Paddle Webhook] Generated license for ${email}: ${newLicenseKey}`);

      return NextResponse.json({ received: true, licenseGenerated: true });
    }

    if (event.event_type === 'subscription.canceled') {
      console.log(`[Paddle Webhook] Subscription canceled for ${event.data.customer_id}`);
      return NextResponse.json({ received: true, action: 'cancel' });
    }

    return NextResponse.json({ received: true, ignored: true });

  } catch (error) {
    console.error("[Paddle Webhook Error]", error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
