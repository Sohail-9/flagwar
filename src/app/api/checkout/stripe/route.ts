import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getTeamById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      team_id,
      amount_dollars = 1,
      contributor_name = 'Anonymous Backer',
      handle,
      message,
      referral_slug,
    } = body;

    const team = await getTeamById(team_id);
    if (!team) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const amount_cents = Math.max(100, Math.round(Number(amount_dollars) * 100));

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          needs_config: true,
          error: 'STRIPE_SECRET_KEY is not set. Use Demo / Instant Sandbox mode to test contributions without keys.',
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia' as any,
    });

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Dollar War Backing: ${team.flag} ${team.name}`,
              description: `Support ${team.name} in the worldwide territorial Dollar War!`,
              images: [],
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        team_id: team.id,
        team_slug: team.slug,
        contributor_name,
        handle: handle || '',
        message: message || '',
        referral_slug: referral_slug || '',
      },
      success_url: `${origin}/t/${team.slug}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/t/${team.slug}?status=cancelled`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      session_id: session.id,
    });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
