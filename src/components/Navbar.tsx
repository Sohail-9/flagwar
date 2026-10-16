'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Shield, Trophy, Users, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'board' | 'waitlist' | 'hall-of-fame';
  setActiveTab: (tab: 'board' | 'waitlist' | 'hall-of-fame') => void;
  onOpenBackModal?: () => void;
  totalBackersCount?: number;
  totalDollarsCount?: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenBackModal,
  totalBackersCount = 0,
  totalDollarsCount = 0,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#080b12]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
                  DOLLAR WAR
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  FLAG WAR
                </span>
              </div>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                The global $1 territory clash • Back your place
              </p>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'board'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Live Board</span>
            </button>

            <button
              onClick={() => setActiveTab('waitlist')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'waitlist'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Step 1: Waitlist</span>
            </button>

            <button
              onClick={() => setActiveTab('hall-of-fame')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'hall-of-fame'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Hall of Fame</span>
            </button>
          </nav>

          {/* Action & Stats */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-3 text-xs bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-lg">
              <span className="flex items-center space-x-1 text-gray-400">
                <span>Backed:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ${totalDollarsCount.toLocaleString()}
                </span>
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="flex items-center space-x-1 text-gray-400">
                <span>Backers:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {totalBackersCount.toLocaleString()}
                </span>
              </span>
            </div>

            {onOpenBackModal && (
              <button
                onClick={onOpenBackModal}
                className="relative group overflow-hidden rounded-xl p-[1px] font-bold text-xs"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 animate-shimmer" />
                <span className="relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gray-950 text-white group-hover:bg-opacity-80 transition-all">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Back Territory</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
