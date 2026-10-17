'use client';

import React, { useRef, useState } from 'react';
import { Shield, Sparkles, Download, Twitter, MessageCircle, Copy, Check, Award, Flame } from 'lucide-react';
import { Team } from '@/lib/types';

interface CitizenPassCardProps {
  contributorName: string;
  handle?: string;
  team: Team;
  amountDollars: number;
  message?: string;
  citizenNumber?: number;
  onClose?: () => void;
}

export default function CitizenPassCard({
  contributorName,
  handle,
  team,
  amountDollars,
  message,
  citizenNumber = 42,
  onClose,
}: CitizenPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const getRankTier = (dollars: number) => {
    if (dollars >= 100) return { title: 'SUPREME COMMANDER', color: 'from-amber-400 to-yellow-600', badge: '⭐⭐⭐' };
    if (dollars >= 25) return { title: 'GUARDIAN OF THE REALM', color: 'from-purple-400 to-indigo-600', badge: '⭐⭐' };
    if (dollars >= 5) return { title: 'CENTURION DEFENDER', color: 'from-emerald-400 to-teal-600', badge: '⭐' };
    return { title: 'VERIFIED CITIZEN DEFENDER', color: 'from-sky-400 to-blue-600', badge: '🛡️' };
  };

  const rank = getRankTier(amountDollars);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dollarwar.com';
  const referralUrl = `${currentOrigin}/t/${team.slug}?ref=${team.slug}`;

  const shareText = `⚔️ I just backed ${team.flag} ${team.name} in Dollar War and earned my Citizen Pass #${citizenNumber.toString().padStart(4, '0')} (${rank.title})! Rally with me: ${referralUrl}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Generate image on canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 600);
    bgGrad.addColorStop(0, '#0c101d');
    bgGrad.addColorStop(0.5, '#151d33');
    bgGrad.addColorStop(1, '#070a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 600);

    // Border glow
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 960, 560);

    // Header badge
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('DOLLAR WAR — OFFICIAL CITIZEN PASS', 60, 80);

    // Flag
    ctx.font = '100px sans-serif';
    ctx.fillText(team.flag, 60, 220);

    // Territory Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.fillText(team.name, 190, 180);

    // Title / Tier
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${rank.title} ${rank.badge}`, 190, 230);

    // Contributor & Handle
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 32px sans-serif';
    const displayName = handle ? `@${handle}` : contributorName;
    ctx.fillText(displayName, 60, 340);

    // Amount & Ledger Verification
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`$${amountDollars}.00 MINTED`, 60, 420);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Pass #${citizenNumber.toString().padStart(4, '0')} • Verified on Postgres Ledger`, 60, 470);

    if (message) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 20px sans-serif';
      ctx.fillText(`"${message.slice(0, 60)}"`, 60, 520);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `CitizenPass_${team.name}_${citizenNumber}.png`;
    a.click();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Holographic Pass Container */}
      <div
        ref={cardRef}
        className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-gray-900 via-[#0e1628] to-gray-950 border border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden group"
      >
        {/* Hologram sheen effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/5 to-cyan-500/10 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              DOLLAR WAR CITIZEN PASS
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              #{citizenNumber.toString().padStart(4, '0')}
            </span>
          </div>
        </div>

        {/* Identity & Flag Section */}
        <div className="my-6 flex items-center space-x-5">
          <div className="text-6xl sm:text-7xl p-3 bg-gray-950/80 rounded-2xl border border-gray-800 shrink-0">
            {team.flag}
          </div>
          <div className="truncate">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              DEFENDER OF
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white truncate tracking-tight">
              {team.name}
            </h3>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-gradient-to-r ${rank.color} text-gray-950`}>
                {rank.title}
              </span>
              <span className="text-xs">{rank.badge}</span>
            </div>
          </div>
        </div>

        {/* Contributor Profile & Backing Amount */}
        <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800/80 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">
                CITIZEN BACKER
              </span>
              <div className="text-base font-bold text-white mt-0.5">
                {handle ? `@${handle.replace(/^@/, '')}` : contributorName || 'Anonymous Hero'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">
                AMOUNT BACKED
              </span>
              <span className="text-xl font-black font-mono text-emerald-400">
                +${amountDollars}.00
              </span>
            </div>
          </div>

          {message && (
            <div className="mt-3 pt-3 border-t border-gray-800/60 text-xs italic text-gray-400 truncate">
              &ldquo;{message}&rdquo;
            </div>
          )}
        </div>

        {/* Footer Verification Stamp */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-semibold">
          <div className="flex items-center space-x-1 text-emerald-400">
            <Award className="w-3.5 h-3.5" />
            <span>IMMUTABLE POSTGRES RECORD</span>
          </div>
          <span>SEASON 1 • 2026</span>
        </div>
      </div>

      {/* Action Controls: Download, Social Share & Copy */}
      <div className="mt-5 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Citizen Pass PNG</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors border border-gray-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Recruit'}</span>
          </button>
        </div>

        {/* 1-Click Viral Flex Share */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-black hover:bg-gray-900 border border-gray-800 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors"
          >
            <Twitter className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            <span>Post Pass on X</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 text-xs font-bold text-emerald-300 flex items-center justify-center space-x-2 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Flex</span>
          </a>
        </div>
      </div>
    </div>
  );
}
