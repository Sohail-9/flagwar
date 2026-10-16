import { NextRequest, NextResponse } from 'next/server';
import { getWaitlistStats, recordWaitlistPledge } from '@/lib/db';
import { broadcastLiveEvent } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getWaitlistStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { team_id, email, handle, pledged_cents } = body;

    if (!team_id || !email) {
      return NextResponse.json(
        { success: false, error: 'team_id and email are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const pledge = await recordWaitlistPledge({
      team_id,
      email,
      handle,
      pledged_cents: pledged_cents || 100,
    });

    const stats = await getWaitlistStats();

    // Broadcast update
    broadcastLiveEvent({
      type: 'score_update',
      data: {
        source: 'waitlist',
        team_id,
        total_pledges: stats.total_pledges,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pre-commit registered successfully! You will be notified at launch.',
      pledge,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
