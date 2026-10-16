import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordPayment, getTeamById } from '@/lib/db';
import { zincrby, broadcastLiveEvent } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook secrets not configured' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-01-27.acacia' as any,
  });

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle checkout.session.completed per spec
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const teamId = session.metadata?.team_id;

    if (!teamId) {
      console.warn('Stripe checkout session missing team_id in metadata');
      return NextResponse.json({ received: true });
    }

    const team = await getTeamById(teamId);
    if (!team) {
      console.warn(`Stripe session references unknown team_id: ${teamId}`);
      return NextResponse.json({ received: true });
    }

    const amountCents = session.amount_total || 100;
    const contributorName = session.metadata?.contributor_name || 'Anonymous Backer';
    const handle = session.metadata?.handle;
    const message = session.metadata?.message;
    const referralSlug = session.metadata?.referral_slug;

    // 1. Insert payment row once (unique on session id)
    const { payment, isNew } = await recordPayment({
      provider: 'stripe',
      provider_session_id: session.id, // Strictly unique
      team_id: team.id,
      amount_cents: amountCents,
      contributor_name: contributorName,
      handle,
      message,
      referral_slug: referralSlug,
    });

    // 2. Only credit points if this is the first time processing this webhook
    if (isNew) {
      const newScoreCents = await zincrby(team.id, amountCents);

      const safeName = handle ? `@${handle.replace(/^@/, '')}` : contributorName.split(/\s+/)[0];

      // 3. Publish update event over SSE
      broadcastLiveEvent({
        type: 'new_contribution',
        data: {
          id: payment.id,
          team_id: team.id,
          team_name: team.name,
          team_flag: team.flag,
          team_slug: team.slug,
          amount_dollars: Math.floor(amountCents / 100),
          contributor: safeName,
          message: payment.message,
          new_score_dollars: Math.floor(newScoreCents / 100),
          timestamp: Date.now(),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
