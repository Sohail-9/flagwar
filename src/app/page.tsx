'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ReignBanner from '@/components/ReignBanner';
import TickerMarquee from '@/components/TickerMarquee';
import Podium from '@/components/Podium';
import LeaderboardTable from '@/components/LeaderboardTable';
import ContributionModal from '@/components/ContributionModal';
import WaitlistSection from '@/components/WaitlistSection';
import HallOfFameSection from '@/components/HallOfFameSection';
import { LeaderboardEntry, Team, SeasonState, ReignState } from '@/lib/types';
import { Shield, Sparkles, AlertTriangle, Radio, Volume2, VolumeX, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCoinSound, playRegalFanfare } from '@/lib/audio';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'board' | 'waitlist' | 'hall-of-fame'>('board');
  const [boardEntries, setBoardEntries] = useState<LeaderboardEntry[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [teamMap, setTeamMap] = useState<Map<string, Team>>(new Map());
  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [reign, setReign] = useState<ReignState & { team?: Team }>({
    current_lead_team_id: 'c_in',
    lead_start_timestamp: Date.now() - 3600 * 4 * 1000,
    duration_seconds: 14400,
  });
  const [season, setSeason] = useState<SeasonState | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Real-time Visual Enhancements
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [highlightedTeamId, setHighlightedTeamId] = useState<string | null>(null);
  const [floatingToast, setFloatingToast] = useState<{
    id: string;
    flag: string;
    name: string;
    amount: number;
    contributor: string;
  } | null>(null);
  const [isSurging, setIsSurging] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTeam, setModalInitialTeam] = useState<Team | null>(null);

  // Toast / Live takeover banner
  const [takeoverAlert, setTakeoverAlert] = useState<{ newLead: string; prevLead: string } | null>(null);

  // Fetch initial board state
  const loadInitialData = async () => {
    try {
      const [boardRes, teamsRes] = await Promise.all([
        fetch('/api/board'),
        fetch('/api/teams'),
      ]);

      const boardData = await boardRes.json();
      const teamsData = await teamsRes.json();

      if (teamsData.success) {
        setAllTeams(teamsData.teams);
        const map = new Map<string, Team>();
        teamsData.teams.forEach((t: Team) => map.set(t.id, t));
        setTeamMap(map);
      }

      if (boardData.success) {
        setBoardEntries(boardData.board);
        setReign(boardData.reign);
        setRecentContributions(boardData.recent);
        setSeason(boardData.season);
      }
    } catch (err) {
      console.error('Failed loading board data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Server-Sent Events (SSE) live push connection
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/stream');

      eventSource.addEventListener('update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'new_contribution') {
            const data = payload.data;

            // Trigger synthesized sound if enabled
            if (soundEnabled) {
              playCoinSound();
            }

            // Highlight the backed row on the board
            setHighlightedTeamId(data.team_id);
            setTimeout(() => setHighlightedTeamId(null), 2500);

            // Trigger floating live toast
            setFloatingToast({
              id: data.id,
              flag: data.team_flag,
              name: data.team_name,
              amount: data.amount_dollars,
              contributor: data.contributor,
            });
            setTimeout(() => setFloatingToast(null), 4500);

            // Prepend to recent ticker wire
            setRecentContributions((prev) => [
              {
                id: data.id,
                team_id: data.team_id,
                contributor: data.contributor,
                amount_dollars: data.amount_dollars,
                message: data.message,
                created_at: new Date().toISOString(),
              },
              ...prev.slice(0, 19),
            ]);

            // Re-fetch fresh ranked board to guarantee exact Redis order
            fetch('/api/board')
              .then((res) => res.json())
              .then((resData) => {
                if (resData.success) {
                  setBoardEntries(resData.board);
                  setReign(resData.reign);
                }
              });
          } else if (payload.type === 'rank_takeover') {
            const takeover = payload.data;
            if (soundEnabled) {
              playRegalFanfare();
            }

            setTakeoverAlert({
              newLead: takeover.new_lead,
              prevLead: takeover.previous_lead,
            });

            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.3 },
            });

            setTimeout(() => setTakeoverAlert(null), 8000);
          }
        } catch (e) {
          console.error('SSE message parsing error:', e);
        }
      });

      eventSource.addEventListener('reign_tick', (event) => {
        try {
          const payload = JSON.parse(event.data);
          setReign(payload);
        } catch {
          // ignore
        }
      });

      eventSource.onerror = () => {
        // SSE will automatically retry
      };
    } catch (err) {
      console.warn('Could not connect to SSE stream:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleOpenBackModal = (team?: Team) => {
    setModalInitialTeam(team || (boardEntries[0]?.team ?? allTeams[0] ?? null));
    setIsModalOpen(true);
  };

  const handleContributionSuccess = () => {
    loadInitialData();
  };

  // Live real-time demonstration surge
  const triggerWarSurge = async () => {
    if (isSurging || allTeams.length === 0) return;
    setIsSurging(true);

    const surgeNames = ['AlphaWolf', 'NeonRider', 'CyberValkyrie', 'ShadowStrike', 'GhostRecon'];
    const targetTeams = allTeams.slice(0, 8);

    for (let i = 0; i < 5; i++) {
      const randomTeam = targetTeams[Math.floor(Math.random() * targetTeams.length)];
      const randomAmount = [1, 5, 10, 25][Math.floor(Math.random() * 4)];
      const randomName = surgeNames[i];

      try {
        await fetch('/api/checkout/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: randomTeam.id,
            amount_dollars: randomAmount,
            contributor_name: randomName,
            handle: randomName.toLowerCase(),
            message: '⚔️ Live War Surge clash!',
          }),
        });
      } catch {
        // ignore
      }

      await new Promise((r) => setTimeout(r, 900));
    }

    setIsSurging(false);
  };

  const totalBackers = boardEntries.reduce((sum, item) => sum + item.backers_count, 0);
  const totalDollars = boardEntries.reduce((sum, item) => sum + item.score_dollars, 0);

  const currentKingTeam = teamMap.get(reign.current_lead_team_id) || boardEntries[0]?.team;

  return (
    <div className="min-h-screen bg-[#080b12] text-white flex flex-col">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackModal={() => handleOpenBackModal()}
        totalBackersCount={totalBackers}
        totalDollarsCount={totalDollars}
      />

      {/* Reign & Season Freeze Bar */}
      <ReignBanner
        leadTeam={currentKingTeam}
        durationSeconds={reign.duration_seconds}
        season={season}
        onBackLeadTeam={(team) => handleOpenBackModal(team)}
      />

      {/* Live War Wire Ticker */}
      <TickerMarquee
        recent={recentContributions}
        teamMap={teamMap}
        onSelectTeam={(team) => handleOpenBackModal(team)}
      />

      {/* Real-time Controls Toolbar */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SSE Stream Connected</span>
          </span>
          <span className="text-gray-500 hidden sm:inline">•</span>
          <span className="text-gray-400 hidden sm:inline">Redis Sorted Sets Active</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              soundEnabled
                ? 'bg-gray-900 border-gray-700 text-amber-400'
                : 'bg-gray-950 border-gray-800 text-gray-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* War Surge Simulator Button */}
          <button
            onClick={triggerWarSurge}
            disabled={isSurging}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-red-600/20 disabled:opacity-50 transition-all"
          >
            <Zap className={`w-3.5 h-3.5 ${isSurging ? 'animate-spin' : ''}`} />
            <span>{isSurging ? 'Surging Battlefield...' : '⚡ Simulate War Surge'}</span>
          </button>
        </div>
      </div>

      {/* Throne Takeover Alert Toast */}
      {takeoverAlert && (
        <div className="w-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 py-2.5 px-4 text-center font-black text-xs sm:text-sm text-white flex items-center justify-center space-x-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 fill-white text-red-600" />
          <span>
            🚨 THRONE TAKEOVER! A new territory has seized #1 on the live battlefield!
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'board' && (
          <div>
            {/* Top 3 Podium */}
            <Podium
              entries={boardEntries.slice(0, 3)}
              onBackTeam={(team) => handleOpenBackModal(team)}
            />

            {/* Ranked Table (Top 50) */}
            <LeaderboardTable
              entries={boardEntries}
              allTeams={allTeams}
              onBackTeam={(team) => handleOpenBackModal(team)}
              highlightedTeamId={highlightedTeamId}
            />
          </div>
        )}

        {activeTab === 'waitlist' && <WaitlistSection allTeams={allTeams} />}

        {activeTab === 'hall-of-fame' && (
          <HallOfFameSection entries={boardEntries} season={season} />
        )}
      </main>

      {/* Floating Live Backing Toast */}
      {floatingToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card p-4 rounded-2xl border border-emerald-500/40 bg-gray-950/95 shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="text-3xl">{floatingToast.flag}</div>
          <div>
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="font-bold text-white">{floatingToast.contributor}</span>
              <span className="text-gray-400">backed</span>
              <span className="font-bold text-amber-400">{floatingToast.name}</span>
            </div>
            <div className="text-sm font-mono font-black text-emerald-400 mt-0.5">
              +${floatingToast.amount}.00 Minted Live
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#06080e] py-8 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="font-semibold text-gray-400">
              Live Redis Sorted Sets Engine & Append-Only Postgres Ledger Active
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-gray-300">Minimum $1 Contribution</span>
            <span>•</span>
            <span className="hover:text-gray-300">Signed Webhooks Only</span>
            <span>•</span>
            <span className="hover:text-gray-300">Cloudflare Protected</span>
          </div>
        </div>
      </footer>

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTeam={modalInitialTeam}
        allTeams={allTeams}
        onContributionSuccess={handleContributionSuccess}
      />
    </div>
  );
}
