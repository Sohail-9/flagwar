'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
  Swords,
  Share2,
  Copy,
  Check,
  Sparkles,
  Twitter,
  Send,
  MessageCircle,
  Shield,
  Flame,
} from 'lucide-react';
import { Team, LeaderboardEntry, Payment } from '@/lib/types';
import ContributionModal from '@/components/ContributionModal';

interface TeamWarRoomClientProps {
  team: Team;
  entry: LeaderboardEntry;
  prevRankTeam: LeaderboardEntry | null | undefined;
  teamRecent: Payment[];
  allTeams: Team[];
  referralParam?: string;
  isCurrentKing: boolean;
}

export default function TeamWarRoomClient({
  team,
  entry,
  prevRankTeam,
  teamRecent,
  allTeams,
  referralParam,
  isCurrentKing,
}: TeamWarRoomClientProps) {
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct referral URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dollarwar.com';
  const shareUrl = `${currentOrigin}/t/${team.slug}?ref=${team.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `⚔️ Rally for ${team.flag} ${team.name} in Dollar War! We are Rank #${entry.rank} with $${entry.score_dollars.toLocaleString()} backed. Help us claim the world throne: ${shareUrl}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`⚔️ Rally for ${team.flag} ${team.name} in Dollar War!`)}`;

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      {/* Top Bar */}
      <header className="border-b border-gray-800 bg-[#0a0e17]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Global War Board</span>
          </Link>

          <button
            onClick={() => setIsBackModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 font-black text-xs hover:from-amber-400 hover:to-orange-400 transition-all flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Back {team.name}</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Referral notice if arrived via referral */}
        {referralParam && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
            <Flame className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              You were recruited via referral! Your contribution directly propels <strong>{team.name}</strong> up the leaderboard.
            </span>
          </div>
        )}

        {/* Team Hero Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-gray-800 bg-gradient-to-b from-[#111827] via-[#0d121f] to-[#080b12] relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
            {/* Left: Flag & identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="text-8xl sm:text-9xl filter drop-shadow-2xl">
                {team.flag}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 border border-gray-700">
                    {team.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 border border-gray-700">
                    {team.code}
                  </span>
                  {team.region && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-800 text-gray-400">
                      {team.region}
                    </span>
                  )}
                  {isCurrentKing && (
                    <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>REIGNING CHAMPION</span>
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {team.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md">
                  Official territory headquarters for {team.name} in Dollar War Season 1.
                </p>
              </div>
            </div>

            {/* Right: Rank & Treasury stats */}
            <div className="flex flex-col items-center md:items-end space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-center bg-gray-950/80 border border-gray-800 px-5 py-3 rounded-2xl">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Global Rank</div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono mt-0.5">
                    #{entry.rank}
                  </div>
                </div>

                <div className="text-center bg-gray-950/80 border border-gray-800 px-5 py-3 rounded-2xl">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Treasury Backed</div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-0.5">
                    ${entry.score_dollars.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 font-medium">
                {entry.backers_count} verified territory backers
              </div>
            </div>
          </div>

          {/* Overtake target banner */}
          {prevRankTeam && (
            <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{prevRankTeam.team.flag}</span>
                <div className="text-xs">
                  <span className="text-gray-300 font-bold">
                    Next Target: #{prevRankTeam.rank} {prevRankTeam.team.name} (${prevRankTeam.score_dollars})
                  </span>
                  <div className="text-amber-400 font-bold mt-0.5">
                    Needs ${(prevRankTeam.score_dollars - entry.score_dollars + 1).toLocaleString()} to overtake!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsBackModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs transition-colors flex items-center space-x-1.5"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Launch Attack (+$1)</span>
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Grid: Share & Recruit vs Backer Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step 7: Viral Share & Referral Loop */}
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <Share2 className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-base text-white">
                Step 7: Viral Recruitment Loop
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Share your custom territory referral link. When friends or followers back through this link, all dollars count towards <strong>{team.name}</strong>!
            </p>

            {/* Custom Link Box */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                Your Territory Referral URL
              </label>
              <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-amber-300 font-mono flex-1 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white flex items-center space-x-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-gray-400">
                1-Click Social Mobilization
              </div>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-black hover:bg-gray-900 border border-gray-800 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                  <span>X / Tweet</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 text-xs font-bold text-emerald-300 flex items-center justify-center space-x-2 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-800/40 text-xs font-bold text-sky-300 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            {/* OpenGraph Preview Mini Card */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="text-[11px] font-bold uppercase text-gray-400 mb-2">
                Auto-Generated Preview Card (@vercel/og)
              </div>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center space-x-4">
                <div className="text-4xl">{team.flag}</div>
                <div>
                  <div className="text-xs font-bold text-white">{team.name} • Rank #{entry.rank}</div>
                  <div className="text-[11px] text-gray-400">Preview image rendered dynamically at /api/og?slug={team.slug}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Backer Roster & War Cries */}
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-gray-800">
            <h3 className="font-bold text-base text-white mb-1 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Territory Defenders Roster</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Real-time ledger of verified contributors defending {team.name}.
            </p>

            <div className="divide-y divide-gray-800/60 max-h-[360px] overflow-y-auto pr-1">
              {teamRecent.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  No verified backers for this territory yet. Be the first to strike!
                </div>
              ) : (
                teamRecent.map((p) => {
                  const safeName = p.handle ? `@${p.handle}` : p.contributor_name.split(/\s+/)[0];
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{safeName}</span>
                          <span className="text-gray-500 text-[10px]">
                            {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {p.message && (
                          <p className="text-gray-400 italic text-[11px] mt-0.5 max-w-sm">
                            &ldquo;{p.message}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          +${Math.floor(p.amount_cents / 100)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Back Territory Modal */}
      <ContributionModal
        isOpen={isBackModalOpen}
        onClose={() => setIsBackModalOpen(false)}
        initialTeam={team}
        allTeams={allTeams}
        onContributionSuccess={() => {
          // Refresh current page
          window.location.reload();
        }}
      />
    </div>
  );
}
