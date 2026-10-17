'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, CreditCard, QrCode, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Team } from '@/lib/types';

import CitizenPassCard from './CitizenPassCard';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTeam: Team | null;
  allTeams: Team[];
  onContributionSuccess?: (data: any) => void;
}

export default function ContributionModal({
  isOpen,
  onClose,
  initialTeam,
  allTeams,
  onContributionSuccess,
}: ContributionModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeam?.id || allTeams[0]?.id || '');
  const [amount, setAmount] = useState<number>(1);
  const [contributorName, setContributorName] = useState<string>('');
  const [handle, setHandle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'demo' | 'stripe' | 'razorpay'>('demo');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; team: Team; amount: number } | null>(null);

  if (!isOpen) return null;

  const currentTeam = allTeams.find((t) => t.id === selectedTeamId) || initialTeam;

  const quickAmounts = [1, 5, 10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (paymentMethod === 'demo') {
        const res = await fetch('/api/checkout/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: currentTeam.id,
            amount_dollars: amount,
            contributor_name: contributorName.trim() || 'Anonymous Backer',
            handle: handle.trim(),
            message: message.trim(),
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to process contribution');
        }

        // Fire festive fireworks confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });

        setSuccessInfo({
          message: data.message,
          team: currentTeam,
          amount,
        });

        onContributionSuccess?.(data);
      } else if (paymentMethod === 'stripe') {
        const res = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: currentTeam.id,
            amount_dollars: amount,
            contributor_name: contributorName.trim() || 'Anonymous Backer',
            handle: handle.trim(),
            message: message.trim(),
          }),
        });

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Stripe checkout unavailable. Please use Instant Sandbox Demo.');
        }
      } else if (paymentMethod === 'razorpay') {
        const res = await fetch('/api/checkout/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: currentTeam.id,
            amount_dollars: amount,
            contributor_name: contributorName.trim() || 'Anonymous Backer',
            handle: handle.trim(),
            message: message.trim(),
          }),
        });

        const data = await res.json();
        if (data.is_demo) {
          // Razorpay in test simulator mode: simulate successful callback
          const demoRes = await fetch('/api/checkout/demo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              team_id: currentTeam.id,
              amount_dollars: amount,
              contributor_name: contributorName.trim() || 'UPI Backer',
              handle: handle.trim(),
              message: message.trim() || 'Backed via UPI 🇮🇳',
            }),
          });
          const demoData = await demoRes.json();
          confetti({ particleCount: 70, spread: 60 });
          setSuccessInfo({
            message: `Paid ₹${data.amount_inr} via UPI Sandbox!`,
            team: currentTeam,
            amount,
          });
          onContributionSuccess?.(demoData);
        } else {
          throw new Error('Razorpay client checkout loaded with order: ' + data.order_id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card rounded-2xl border border-gray-700/80 p-6 sm:p-8 bg-[#0d121f] text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successInfo ? (
          <div className="py-2">
            <CitizenPassCard
              contributorName={contributorName}
              handle={handle}
              team={successInfo.team}
              amountDollars={successInfo.amount}
              message={message}
              citizenNumber={Math.floor(Math.random() * 850) + 42}
            />
            <div className="mt-4 text-center">
              <button
                onClick={resetModal}
                className="py-2 px-6 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors"
              >
                ← Return to Battlefield
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xl">{currentTeam?.flag || '⚔️'}</span>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Back Your Territory
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                Minimum $1. Every dollar directly moves your territory up the world standings.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-2 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Territory Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Selected Territory
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {allTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.flag} {t.name} ({t.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Backing Amount (USD)
              </label>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                      amount === val
                        ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                        : 'bg-gray-950 border border-gray-800 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full pl-7 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  placeholder="Custom amount"
                />
              </div>
            </div>

            {/* Contributor Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Miller"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  X / Social Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                    className="w-full pl-7 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* War Cry Message */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                War Cry / Message (Optional)
              </label>
              <input
                type="text"
                maxLength={140}
                placeholder="Declare your battle cry on the live wire..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Payment Provider Choice */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('demo')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'demo'
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant Demo</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    1-Click Live Test
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Stripe</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Cards & Wallets
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Razorpay UPI</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    India UPI / QR
                  </span>
                </button>
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-gray-950 font-black text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-gray-950" />
                  <span>
                    Commit ${amount} to {currentTeam?.flag} {currentTeam?.name}
                  </span>
                </>
              )}
            </button>

            {/* Legal / Payment Gateway Protection Disclaimer */}
            <p className="text-[10px] text-gray-500 text-center leading-relaxed mt-2">
              🛡️ <strong>Digital Vanity Collectible</strong>: Grants an official Citizen Pass badge & permanent Postgres ledger hall-of-fame record. Non-refundable digital entertainment purchase. Zero prize pools or financial stakes.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
