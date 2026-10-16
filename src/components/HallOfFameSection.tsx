'use client';

import React, { useState } from 'react';
import { Trophy, Archive, Download, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { LeaderboardEntry, SeasonState } from '@/lib/types';

interface HallOfFameSectionProps {
  entries: LeaderboardEntry[];
  season?: SeasonState;
}

export default function HallOfFameSection({ entries, season }: HallOfFameSectionProps) {
  const [isFreezing, setIsFreezing] = useState(false);
  const [freezeSuccess, setFreezeSuccess] = useState<string | null>(null);

  const handleFreezeSeason = async () => {
    setIsFreezing(true);
    try {
      const res = await fetch('/api/season/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'freeze' }),
      });
      const data = await res.json();
      if (data.success) {
        setFreezeSuccess('Season officially frozen! Static HTML Hall of Fame snapshot compiled.');
      }
    } catch (err: any) {
      alert(err.message || 'Freeze failed');
    } finally {
      setIsFreezing(false);
    }
  };

  const downloadStaticSnapshot = () => {
    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dollar War - Season 1 Official Archive</title>
  <style>
    body { background: #0b0f19; color: #fff; font-family: sans-serif; padding: 2rem; max-width: 800px; margin: auto; }
    h1 { color: #f59e0b; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 8px 12px; border-bottom: 1px solid #222; text-align: left; }
  </style>
</head>
<body>
  <h1>🏆 DOLLAR WAR - SEASON 1 HALL OF FAME</h1>
  <p>Archived permanent snapshot. Certified tamper-proof.</p>
  <table>
    <thead><tr><th>Rank</th><th>Territory</th><th>Treasury</th><th>Backers</th></tr></thead>
    <tbody>
      ${entries.slice(0, 20).map((e) => `<tr><td>#${e.rank}</td><td>${e.team.flag} ${e.team.name}</td><td>$${e.score_dollars}</td><td>${e.backers_count}</td></tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dollarwar-season1-hall-of-fame.html';
    a.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Step 8: Season End & Permanent Archive</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          The Hall of Fame & Static Freeze
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto mt-2">
          When the clock strikes zero, the Postgres ledger locks down permanently. 
          The final board is compiled into static HTML, dispatched to Cloudflare Pages/R2, and registered with the Internet Archive Wayback Machine.
        </p>
      </div>

      {freezeSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{freezeSuccess}</span>
          </div>
          <button
            onClick={downloadStaticSnapshot}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML Archive</span>
          </button>
        </div>
      )}

      {/* Snapshot Preview Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-gray-800 bg-[#0a0e1a]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded bg-gray-800 text-amber-400 font-bold">
                {season?.title || 'Season 1: Genesis War'}
              </span>
              <span className="text-xs text-gray-400">
                {season?.is_frozen ? 'Status: Frozen' : 'Status: Live Contest'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Top Historic Champions
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFreezeSeason}
              disabled={isFreezing}
              className="py-2 px-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 flex items-center space-x-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFreezing ? 'Freezing...' : 'Trigger Freeze Job'}</span>
            </button>
            <button
              onClick={downloadStaticSnapshot}
              className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center space-x-1.5 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Export R2 Static</span>
            </button>
          </div>
        </div>

        {/* Historic Top 10 */}
        <div className="divide-y divide-gray-800/60 mt-4">
          {entries.slice(0, 10).map((item) => (
            <div key={item.team.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className={`font-mono font-bold w-6 ${item.rank === 1 ? 'text-amber-400 font-black' : 'text-gray-500'}`}>
                  #{item.rank}
                </span>
                <span className="text-xl">{item.team.flag}</span>
                <div>
                  <span className="font-bold text-white">{item.team.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase ml-2">{item.team.type}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ${item.score_dollars.toLocaleString()}
                </span>
                <div className="text-[10px] text-gray-500">
                  {item.backers_count} verified backers
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
