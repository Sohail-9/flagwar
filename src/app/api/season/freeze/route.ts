import { NextRequest, NextResponse } from 'next/server';
import { getSeasonState, freezeSeason } from '@/lib/db';
import { getTopRankedTeams, getReignStatus } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const season = await getSeasonState();
  const topTeams = await getTopRankedTeams(50);
  const reign = await getReignStatus();

  return NextResponse.json({
    season,
    reign,
    final_leaderboard: topTeams,
    is_frozen: season.is_frozen || new Date() > new Date(season.ends_at),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json().catch(() => ({ action: 'freeze' }));

    if (action === 'freeze') {
      const season = await freezeSeason();
      const finalBoard = await getTopRankedTeams(50);

      // Generate static HTML Hall of Fame snapshot
      const staticHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dollar War - Season 1 Hall of Fame Archive</title>
  <style>
    body { background: #0b0f19; color: #f3f4f6; font-family: system-ui, sans-serif; padding: 2rem; max-width: 900px; margin: 0 auto; }
    h1 { color: #f59e0b; text-align: center; }
    .podium { display: flex; justify-content: center; gap: 1rem; margin: 2rem 0; }
    .card { background: #111827; border: 1px solid #1f2937; padding: 1.5rem; border-radius: 12px; text-align: center; flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
    th, td { padding: 0.75rem 1rem; border-bottom: 1px solid #1f2937; text-align: left; }
    th { color: #9ca3af; text-transform: uppercase; font-size: 0.75rem; }
    .rank-1 { color: #f59e0b; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🏆 Dollar War — Season 1 Official Hall of Fame</h1>
  <p style="text-align: center; color: #9ca3af;">Frozen permanently at ${new Date().toISOString()}</p>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>Type</th>
        <th>Total Raised</th>
        <th>Backers</th>
      </tr>
    </thead>
    <tbody>
      ${finalBoard
        .map(
          (b) => `<tr>
        <td class="${b.rank === 1 ? 'rank-1' : ''}">#${b.rank}</td>
        <td>${b.team.flag} ${b.team.name}</td>
        <td>${b.team.type}</td>
        <td>$${b.score_dollars.toLocaleString()}</td>
        <td>${b.backers_count}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

      return NextResponse.json({
        success: true,
        message: 'Season frozen permanently. Static Hall of Fame snapshot created.',
        season,
        staticHtmlSnapshot: staticHtml,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
