'use client';

import React, { useEffect, useState } from 'react';
import { Crown, Timer, Clock, ArrowUpRight, Zap } from 'lucide-react';
import { Team, SeasonState } from '@/lib/types';

interface ReignBannerProps {
  leadTeam?: Team;
  durationSeconds: number;
  season?: SeasonState;
  onBackLeadTeam?: (team: Team) => void;
}

export default function ReignBanner({
  leadTeam,
  durationSeconds: initialDuration,
  season,
  onBackLeadTeam,
}: ReignBannerProps) {
  const [secondsHeld, setSecondsHeld] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Keep local seconds counter ticking smoothly
  useEffect(() => {
    setSecondsHeld(initialDuration);
  }, [initialDuration]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsHeld((prev) => prev + 1);

      if (season?.ends_at) {
        const diff = new Date(season.ends_at).getTime() - Date.now();
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft({ days, hours, minutes, seconds });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [season]);

  const formatDuration = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/40 via-gray-900 to-indigo-950/40 border-y border-amber-500/20 py-3.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        {/* Left: Crown Reign */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                Current #1 Throne Holder
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded font-mono font-semibold">
                Held for {formatDuration(secondsHeld)}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xl">{leadTeam?.flag || '👑'}</span>
              <span className="font-extrabold text-white text-base tracking-tight">
                {leadTeam?.name || 'Contested Throne'}
              </span>
              {leadTeam && (
                <button
                  onClick={() => onBackLeadTeam?.(leadTeam)}
                  className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 ml-2 group"
                >
                  <span>Defend Throne</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Season 1 Freeze Countdown */}
        <div className="flex items-center space-x-3 bg-gray-950/80 border border-gray-800 px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-orange-400" />
          <div className="text-xs">
            <span className="text-gray-400 mr-2 font-medium">Season 1 Freeze:</span>
            <span className="font-mono font-bold text-amber-400">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
