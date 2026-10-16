import { NextRequest, NextResponse } from 'next/server';
import { recordPayment, getTeamById } from '@/lib/db';
import { zincrby, broadcastLiveEvent, getTopRankedTeams, getReignStatus } from '@/lib/redis';

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

    if (!team_id) {
      return NextResponse.json({ success: false, error: 'team_id is required' }, { status: 400 });
    }

    const team = await getTeamById(team_id);
    if (!team) {
      return NextResponse.json({ success: false, error: 'Invalid team_id' }, { status: 400 });
    }

    const amount_cents = Math.max(100, Math.round(Number(amount_dollars) * 100));
    const sessionId = `demo_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 1. Record into append-only payment ledger (strict idempotency)
    const { payment, isNew } = await recordPayment({
      provider: 'mock',
      provider_session_id: sessionId,
      team_id: team.id,
      amount_cents,
      contributor_name,
      handle,
      message,
      referral_slug,
    });

    if (!isNew) {
      return NextResponse.json({ success: true, message: 'Already processed', payment });
    }

    // 2. Increment score in Redis sorted set (ZINCRBY)
    const newScoreCents = await zincrby(team.id, amount_cents);

    // 3. Broadcast real-time SSE event to all connected clients
    const safeName = handle ? `@${handle.replace(/^@/, '')}` : contributor_name.split(/\s+/)[0] || 'Anonymous';
    
    broadcastLiveEvent({
      type: 'new_contribution',
      data: {
        id: payment.id,
        team_id: team.id,
        team_name: team.name,
        team_flag: team.flag,
        team_slug: team.slug,
        amount_dollars: Math.floor(amount_cents / 100),
        contributor: safeName,
        message: payment.message,
        new_score_dollars: Math.floor(newScoreCents / 100),
        timestamp: Date.now(),
      },
    });

    const [updatedBoard, updatedReign] = await Promise.all([
      getTopRankedTeams(50),
      getReignStatus(),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully backed ${team.flag} ${team.name} with $${amount_dollars}!`,
      payment,
      team,
      board: updatedBoard,
      reign: updatedReign,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
