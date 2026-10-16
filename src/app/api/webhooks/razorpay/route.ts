import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordPayment, getTeamById } from '@/lib/db';
import { zincrby, broadcastLiveEvent } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid Razorpay signature' }, { status: 400 });
    }
  }

  try {
    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const teamId = notes.team_id;

      if (!teamId) {
        return NextResponse.json({ received: true });
      }

      const team = await getTeamById(teamId);
      if (!team) {
        return NextResponse.json({ received: true });
      }

      // 85 INR is approximately $1 (100 cents)
      const amountPaise = paymentEntity.amount || 8500;
      const amountCents = Math.max(100, Math.round((amountPaise / 8500) * 100));

      const { payment, isNew } = await recordPayment({
        provider: 'razorpay',
        provider_session_id: paymentEntity.id || `rzp_${Date.now()}`,
        team_id: team.id,
        amount_cents: amountCents,
        contributor_name: notes.contributor_name || 'Anonymous Backer',
        handle: notes.handle,
        message: notes.message,
        referral_slug: notes.referral_slug,
      });

      if (isNew) {
        const newScoreCents = await zincrby(team.id, amountCents);
        const safeName = notes.handle
          ? `@${notes.handle.replace(/^@/, '')}`
          : (notes.contributor_name || 'Anonymous').split(/\s+/)[0];

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

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
