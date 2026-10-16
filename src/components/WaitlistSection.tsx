'use client';

import React, { useState, useEffect } from 'react';
import { Users, Target, CheckCircle2, Sparkles, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team } from '@/lib/types';

interface WaitlistSectionProps {
  allTeams: Team[];
}

export default function WaitlistSection({ allTeams }: WaitlistSectionProps) {
  const [stats, setStats] = useState<{
    total_pledges: number;
    total_dollars: number;
    target_goal: number;
    team_breakdown: any[];
  }>({
    total_pledges: 5,
    total_dollars: 5,
    target_goal: 500,
    team_breakdown: [],
  });

  const [selectedTeamId, setSelectedTeamId] = useState(allTeams[0]?.id || 'c_in');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/waitlist');
      const data = await res.json();
      if (data.success) {
        setStats({
          total_pledges: data.total_pledges,
          total_dollars: data.total_dollars,
          target_goal: data.target_goal,
          team_breakdown: data.team_breakdown,
        });
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: selectedTeamId,
          email,
          handle,
          pledged_cents: 100, // $1 pre-commit per doc
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit pre-commit');
      }

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setSuccess(true);
      fetchStats();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const percent = Math.min(100, Math.round((stats.total_pledges / stats.target_goal) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      {/* Step 1 Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Target className="w-3.5 h-3.5" />
          <span>Step 1: Viral Demand Validation Test</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Will Your Territory Rally For The War?
        </h2>
        <p className="text-sm text-gray-400 max-w-xl mx-auto mt-2">
          Per the Dollar War playbook: we only write live production payment rails once 500 players pre-commit $1. 
          Pledge your support now to unlock your territory!
        </p>
      </div>

      {/* 500 Pre-Commit Goal Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-gray-900 to-gray-950 mb-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">
              Target Activation Goal
            </div>
            <div className="text-3xl font-black text-white font-mono mt-1">
              <span className="text-emerald-400">{stats.total_pledges}</span>
              <span className="text-gray-500"> / {stats.target_goal} Pre-Commits</span>
            </div>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              {percent}% Validated
            </span>
            <div className="text-[11px] text-gray-400 mt-1">
              {stats.target_goal - stats.total_pledges} more backers needed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-950 rounded-full h-4 p-0.5 border border-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-700 shadow-sm shadow-emerald-500/50"
            style={{ width: `${Math.max(2, percent)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Pre-commit Form */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-gray-800">
          <h3 className="font-bold text-lg text-white mb-1 flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Pre-Commit $1 For Your Place</span>
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Zero upfront charge today. You will receive an instant priority invite link when Season 1 kicks off.
          </p>

          {success ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-white">Pre-Commit Recorded!</h4>
              <p className="text-xs text-gray-400 mt-1">
                We added your vote to the leaderboard. Share with your friends to unlock your place faster!
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white rounded-xl transition-colors"
              >
                Pledge for another place
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Choose Territory
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {allTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.flag} {t.name} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Your Email (For Verification & Ticket)
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Twitter / X Handle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="@handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-gray-950" />
                    <span>Pre-Commit $1 Pledge</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Live Counter Per Place Leaderboard */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Place Pre-Commit Standings</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">Live Counter</span>
          </div>

          <div className="divide-y divide-gray-800/60 max-h-[320px] overflow-y-auto pr-1">
            {stats.team_breakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Be the first to pledge for your territory!
              </div>
            ) : (
              stats.team_breakdown.map((item, idx) => (
                <div key={item.team.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-gray-500 font-bold w-4">#{idx + 1}</span>
                    <span className="text-lg">{item.team.flag}</span>
                    <span className="font-bold text-white">{item.team.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {item.count} pledged
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
