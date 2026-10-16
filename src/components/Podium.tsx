'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Sparkles, Swords, ArrowRight } from 'lucide-react';
import { LeaderboardEntry, Team } from '@/lib/types';

interface PodiumProps {
  entries: LeaderboardEntry[];
  onBackTeam: (team: Team) => void;
}

export default function Podium({ entries, onBackTeam }: PodiumProps) {
  if (entries.length < 3) return null;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <div className="w-full py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>The Global Crown Standings</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Territories Vying for World Supremacy
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto mt-1">
          Every single dollar shifts the global balance of power. Defend your nation or rally a coup!
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6">
        {/* Second Place (Silver) */}
        <div className="order-2 md:order-1 glass-card rounded-2xl p-6 text-center border-gray-700/60 relative group hover:border-slate-400 transition-all duration-300 transform md:-translate-y-2">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-300 text-gray-950 font-black text-xs px-3 py-1 rounded-full shadow-lg">
            #2 SILVER
          </div>
          <div className="text-5xl my-3 group-hover:scale-110 transition-transform">
            {second.team.flag}
          </div>
          <h3 className="font-extrabold text-lg text-white truncate">
            {second.team.name}
          </h3>
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
            {second.team.type} • {second.team.code}
          </span>

          <div className="my-4 py-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ${second.score_dollars.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400">
              {second.backers_count} backers
            </div>
          </div>

          <div className="text-[11px] text-amber-400/90 mb-3 font-semibold">
            Needs ${(first.score_dollars - second.score_dollars + 1).toLocaleString()} to overtake #1
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onBackTeam(second.team)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-200 hover:bg-white text-gray-950 font-bold text-xs flex items-center justify-center space-x-1 transition-all"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Back +$1</span>
            </button>
            <Link
              href={`/t/${second.team.slug}`}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              title="Team War Room"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* First Place (Gold) */}
        <div className="order-1 md:order-2 glass-card rounded-2xl p-7 text-center border-amber-500/50 glow-gold relative group hover:border-amber-400 transition-all duration-300 transform md:-translate-y-6 bg-gradient-to-b from-amber-950/30 via-gray-900 to-gray-950">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 font-black text-xs px-4 py-1 rounded-full shadow-lg shadow-amber-500/30 flex items-center space-x-1">
            <Crown className="w-3.5 h-3.5 fill-gray-950" />
            <span>#1 REIGNING KING</span>
          </div>

          <div className="text-6xl my-4 group-hover:scale-110 transition-transform animate-pulse-fast">
            {first.team.flag}
          </div>
          <h3 className="font-black text-xl text-white tracking-tight truncate">
            {first.team.name}
          </h3>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
            {first.team.type} • {first.team.code}
          </span>

          <div className="my-5 py-4 bg-gray-950/80 rounded-xl border border-amber-500/30">
            <div className="text-3xl font-black text-amber-400 font-mono text-glow-gold">
              ${first.score_dollars.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {first.backers_count} defenders defending throne
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onBackTeam(first.team)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-gray-950" />
              <span>Defend Throne (+$1)</span>
            </button>
            <Link
              href={`/t/${first.team.slug}`}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-400 transition-colors"
              title="Team War Room"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Third Place (Bronze) */}
        <div className="order-3 glass-card rounded-2xl p-6 text-center border-gray-700/60 relative group hover:border-amber-700 transition-all duration-300 transform md:-translate-y-0">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg">
            #3 BRONZE
          </div>
          <div className="text-5xl my-3 group-hover:scale-110 transition-transform">
            {third.team.flag}
          </div>
          <h3 className="font-extrabold text-lg text-white truncate">
            {third.team.name}
          </h3>
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
            {third.team.type} • {third.team.code}
          </span>

          <div className="my-4 py-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ${third.score_dollars.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400">
              {third.backers_count} backers
            </div>
          </div>

          <div className="text-[11px] text-amber-400/90 mb-3 font-semibold">
            Needs ${(second.score_dollars - third.score_dollars + 1).toLocaleString()} to catch #2
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onBackTeam(third.team)}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Back +$1</span>
            </button>
            <Link
              href={`/t/${third.team.slug}`}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              title="Team War Room"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
