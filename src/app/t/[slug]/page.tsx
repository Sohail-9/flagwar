import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTeamBySlug, getAllTeams, getRecentContributions } from '@/lib/db';
import { getTopRankedTeams, getReignStatus } from '@/lib/redis';
import TeamWarRoomClient from './TeamWarRoomClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) return { title: 'Territory Not Found | Dollar War' };

  const ogUrl = `/api/og?slug=${team.slug}`;

  return {
    title: `${team.flag} ${team.name} | Dollar War Battlefield`,
    description: `Support ${team.name} in Dollar War! Back your territory with $1 and help conquer the global leaderboard.`,
    openGraph: {
      title: `${team.flag} ${team.name} — Dollar War`,
      description: `Back ${team.name} with $1 and dominate the global rankings!`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `${team.name} Dollar War Banner`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${team.flag} ${team.name} — Dollar War`,
      description: `Back ${team.name} with $1 and dominate the global rankings!`,
      images: [ogUrl],
    },
  };
}

export default async function TeamPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;
  const referralParam = typeof search.ref === 'string' ? search.ref : undefined;

  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const [topTeams, allTeams, recentPayments, reign] = await Promise.all([
    getTopRankedTeams(100),
    getAllTeams(),
    getRecentContributions(50),
    getReignStatus(),
  ]);

  const entry = topTeams.find((e) => e.team.id === team.id) || {
    rank: 99,
    team,
    score_cents: 0,
    score_dollars: 0,
    backers_count: 0,
    gap_to_next: 0,
    is_lead: false,
  };

  // Team-specific contributions
  const teamRecent = recentPayments
    .filter((p) => p.team_id === team.id)
    .slice(0, 15);

  // Next team ahead
  const prevRankTeam = entry.rank > 1 ? topTeams.find((e) => e.rank === entry.rank - 1) : null;

  return (
    <TeamWarRoomClient
      team={team}
      entry={entry}
      prevRankTeam={prevRankTeam}
      teamRecent={teamRecent}
      allTeams={allTeams}
      referralParam={referralParam}
      isCurrentKing={reign.current_lead_team_id === team.id}
    />
  );
}
