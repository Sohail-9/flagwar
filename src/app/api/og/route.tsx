import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { INITIAL_TEAMS } from '@/lib/seed-data';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'india';

    // We can also accept direct params for speed
    const nameParam = searchParams.get('name');
    const flagParam = searchParams.get('flag');
    const rankParam = searchParams.get('rank');
    const scoreParam = searchParams.get('score');

    let teamName = nameParam || 'Flag War';
    let teamFlag = flagParam || '⚔️';
    let rank = rankParam || '1';
    let score = scoreParam || '100';

      const team = INITIAL_TEAMS.find((t) => t.slug === slug);
      if (team) {
        teamName = team.name;
        teamFlag = team.flag;
      }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0f19',
            backgroundImage:
              'radial-gradient(circle at 50% 10%, #1e1b4b 0%, #0b0f19 80%)',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Top badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              borderRadius: '9999px',
              padding: '8px 24px',
              marginBottom: '20px',
              color: '#f59e0b',
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            ⚔️ DOLLAR WAR — TERRITORY CLASH
          </div>

          {/* Main flag & title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '110px',
              marginBottom: '10px',
            }}
          >
            {teamFlag}
          </div>

          <div
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1px',
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            {teamName}
          </div>

          {/* Rank & War Stats */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '16px',
                padding: '16px 36px',
              }}
            >
              <span style={{ color: '#9ca3af', fontSize: '18px', fontWeight: 600 }}>CURRENT RANK</span>
              <span style={{ color: '#f59e0b', fontSize: '42px', fontWeight: 900 }}>#{rank}</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '16px',
                padding: '16px 36px',
              }}
            >
              <span style={{ color: '#9ca3af', fontSize: '18px', fontWeight: 600 }}>TOTAL BACKED</span>
              <span style={{ color: '#10b981', fontSize: '42px', fontWeight: 900 }}>${score}</span>
            </div>
          </div>

          {/* Call to action */}
          <div
            style={{
              marginTop: '32px',
              fontSize: '22px',
              color: '#cbd5e1',
              fontWeight: 500,
            }}
          >
            Back with $1 to defend the throne! 🚀 dollarwar.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
