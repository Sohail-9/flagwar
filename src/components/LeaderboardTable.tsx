'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Swords, Sparkles, Filter, Users, DollarSign, Info } from 'lucide-react';
import { LeaderboardEntry, Team } from '@/lib/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  allTeams: Team[];
  onBackTeam: (team: Team) => void;
  highlightedTeamId?: string | null;
  rankingMode?: 'treasury' | 'mobilization';
  onToggleRankingMode?: (mode: 'treasury' | 'mobilization') => void;
}

export default function LeaderboardTable({
  entries,
  allTeams,
  onBackTeam,
  highlightedTeamId,
  rankingMode = 'treasury',
  onToggleRankingMode,
}: LeaderboardTableProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'country' | 'state' | 'city'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Top score for progress bar calculations
  const maxScore =
    entries.length > 0
      ? rankingMode === 'mobilization'
        ? Math.max(1, entries[0].mobilization_score)
        : Math.max(1, entries[0].score_dollars)
      : 100;

  // Filter entries
  const filtered = entries.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.team.type === activeFilter;
    const matchesQuery =
      searchQuery === '' ||
      item.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.team.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.team.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Ranking Mode Toggle: Anti-Whale Mobilization vs Treasury */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Leaderboard Engine
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
              {rankingMode === 'mobilization' ? '🛡️ Anti-Whale Active' : '💰 Capital Weight'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-md">
            {rankingMode === 'mobilization'
              ? "Ranked by People's Mobilization Power (Backers × √Treasury). 1,000 citizens beat 1 billionaire!"
              : 'Ranked by total treasury dollars collected in the Postgres ledger.'}
          </p>
        </div>

        <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => onToggleRankingMode?.('treasury')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              rankingMode === 'treasury'
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Treasury ($)</span>
          </button>

          <button
            onClick={() => onToggleRankingMode?.('mobilization')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              rankingMode === 'mobilization'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People Power (Anti-Whale)</span>
          </button>
        </div>
      </div>

      {/* Controls: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex items-center space-x-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Territories
          </button>
          <button
            onClick={() => setActiveFilter('country')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'country'
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🌍 Countries
          </button>
          <button
            onClick={() => setActiveFilter('state')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'state'
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🇮🇳 Indian States
          </button>
          <button
            onClick={() => setActiveFilter('city')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'city'
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏙️ Cities
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search country, state, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-900/90 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-card rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-gray-900/80 border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5 sm:col-span-4">Territory</div>
          <div className="hidden sm:block col-span-3">
            {rankingMode === 'mobilization' ? 'Mobilization Power' : 'Treasury Progress'}
          </div>
          <div className="col-span-3 sm:col-span-2 text-right">
            {rankingMode === 'mobilization' ? 'Power Pts' : 'Treasury'}
          </div>
          <div className="col-span-3 sm:col-span-2 text-right">Back</div>
        </div>

        <div className="divide-y divide-gray-800/50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No places found matching &ldquo;{searchQuery}&rdquo;. Try another search!
            </div>
          ) : (
            filtered.map((item) => {
              const currentScore = rankingMode === 'mobilization' ? item.mobilization_score : item.score_dollars;
              const percent = Math.min(100, Math.round((currentScore / maxScore) * 100));
              const isHighlighted = item.team.id === highlightedTeamId;

              return (
                <div
                  key={item.team.id}
                  className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center transition-all duration-300 ${
                    isHighlighted
                      ? 'bg-emerald-500/20 border-y border-emerald-400 glow-emerald scale-[1.01]'
                      : item.rank === 1
                      ? 'bg-amber-500/[0.04] hover:bg-gray-850/40'
                      : 'hover:bg-gray-850/40'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center font-black">
                    {item.rank === 1 ? (
                      <span className="text-amber-400 text-sm font-mono">👑 1</span>
                    ) : item.rank === 2 ? (
                      <span className="text-slate-300 text-sm font-mono">🥈 2</span>
                    ) : item.rank === 3 ? (
                      <span className="text-amber-600 text-sm font-mono">🥉 3</span>
                    ) : (
                      <span className="text-gray-400 text-xs font-mono">#{item.rank}</span>
                    )}
                  </div>

                  {/* Territory info */}
                  <div className="col-span-5 sm:col-span-4 flex items-center space-x-3">
                    <span className="text-2xl shrink-0">{item.team.flag}</span>
                    <div className="truncate">
                      <Link
                        href={`/t/${item.team.slug}`}
                        className="font-bold text-sm text-white hover:text-amber-400 transition-colors flex items-center space-x-1"
                      >
                        <span className="truncate">{item.team.name}</span>
                        {item.stars_count > 0 && (
                          <span className="text-xs shrink-0" title={`${item.stars_count} Throne Defence Stars`}>
                            {'⭐'.repeat(item.stars_count)}
                          </span>
                        )}
                        <ChevronRight className="w-3 h-3 text-gray-600 hover:text-amber-400 shrink-0" />
                      </Link>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                        <span className="uppercase font-semibold">{item.team.type}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-semibold">{item.backers_count} citizens</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="hidden sm:block col-span-3">
                    <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-gray-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rankingMode === 'mobilization'
                            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-sm shadow-emerald-500/50'
                            : item.rank === 1
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-500/50'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${Math.max(4, percent)}%` }}
                      />
                    </div>
                    {item.gap_to_next && item.gap_to_next > 0 ? (
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        +{item.gap_to_next} {rankingMode === 'mobilization' ? 'pts' : '$'} to advance
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold mt-1 block">
                        👑 Throne Leader
                      </span>
                    )}
                  </div>

                  {/* Score Column */}
                  <div className="col-span-3 sm:col-span-2 text-right">
                    {rankingMode === 'mobilization' ? (
                      <div>
                        <div className="font-extrabold text-sm sm:text-base font-mono text-cyan-400">
                          {item.mobilization_score.toLocaleString()} pts
                        </div>
                        <div className="text-[10px] text-gray-500">
                          ${item.score_dollars.toLocaleString()} treasury
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-extrabold text-sm sm:text-base font-mono text-emerald-400">
                          ${item.score_dollars.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-cyan-500 font-mono">
                          {item.mobilization_score} power
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Back Action */}
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <button
                      onClick={() => onBackTeam(item.team)}
                      className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-gray-950 text-white font-bold text-xs transition-all border border-gray-700/60"
                    >
                      <Swords className="w-3 h-3" />
                      <span>Back $1</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
