'use client';

import React from 'react';
import { Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface RecentContribution {
  id: string;
  team_id: string;
  contributor: string;
  amount_dollars: number;
  message?: string;
  created_at: string;
}

interface TickerMarqueeProps {
  recent: RecentContribution[];
  teamMap: Map<string, any>;
  onSelectTeam?: (team: any) => void;
}

export default function TickerMarquee({
  recent,
  teamMap,
  onSelectTeam,
}: TickerMarqueeProps) {
  if (!recent || recent.length === 0) return null;

  return (
    <div className="w-full bg-[#0a0e17] border-b border-gray-800/80 py-2 overflow-hidden flex items-center">
      <div className="px-3 shrink-0 flex items-center space-x-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider border-r border-gray-800 pr-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Live War Wire</span>
      </div>

      <div className="ticker-wrap flex-1">
        <div className="ticker-move flex items-center space-x-8">
          {recent.concat(recent).map((item, idx) => {
            const team = teamMap.get(item.team_id);
            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => team && onSelectTeam?.(team)}
                className="inline-flex items-center space-x-2 text-xs cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <span className="text-gray-400 font-mono">
                  {item.contributor}
                </span>
                <span className="text-gray-600 font-bold">backed</span>
                <span className="text-sm">{team?.flag || '🚩'}</span>
                <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                  {team?.name || 'Territory'}
                </span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  +${item.amount_dollars}
                </span>
                {item.message && (
                  <span className="text-gray-400 italic text-[11px] truncate max-w-[200px]">
                    &ldquo;{item.message}&rdquo;
                  </span>
                )}
                <span className="text-gray-700">|</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
