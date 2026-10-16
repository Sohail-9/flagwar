import { NextResponse } from 'next/server';
import { getTopRankedTeams, getReignStatus } from '@/lib/redis';
import { getRecentContributions, getSeasonState } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [board, reign, recentPayments, season] = await Promise.all([
      getTopRankedTeams(50),
      getReignStatus(),
      getRecentContributions(20),
      getSeasonState(),
    ]);

    // Format recent contributions per spec: first name or handle only
    const formattedRecent = recentPayments.map((p) => {
      const nameParts = p.contributor_name.trim().split(/\s+/);
      const safeName = p.handle ? `@${p.handle}` : nameParts[0] || 'Anonymous';
      return {
        id: p.id,
        team_id: p.team_id,
        contributor: safeName,
        amount_dollars: Math.floor(p.amount_cents / 100),
        message: p.message,
        created_at: p.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      board,
      reign,
      recent: formattedRecent,
      season,
    });
  } catch (err: any) {
    console.error('API /api/board error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed fetching live board' },
      { status: 500 }
    );
  }
}
