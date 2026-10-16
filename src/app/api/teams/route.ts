import { NextRequest, NextResponse } from 'next/server';
import { getAllTeams } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const query = searchParams.get('q')?.toLowerCase().trim();

    let teams = await getAllTeams();

    if (type && ['country', 'state', 'city'].includes(type)) {
      teams = teams.filter((t) => t.type === type);
    }

    if (query) {
      teams = teams.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.slug.toLowerCase().includes(query) ||
          t.code.toLowerCase().includes(query) ||
          (t.region && t.region.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, count: teams.length, teams });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
