import { Redis } from '@upstash/redis';
import { EventEmitter } from 'events';
import { computeScoresFromLedger, getAllTeams, getTeamById } from './db';
import { LeaderboardEntry, ReignState, ContributionEvent } from './types';

// Global SSE event bus for one-way push updates
const globalEventBus = new EventEmitter();
globalEventBus.setMaxListeners(200);

const REDIS_KEY = 'dollarwar:board:s1';
const REIGN_KEY = 'dollarwar:reign:s1';

let upstashClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.warn('Failed initializing Upstash Redis client, using local sorted set:', err);
  }
}

// In-Memory Sorted Set Engine (Mirroring Redis Sorted Sets)
class LocalSortedSet {
  private scores: Map<string, number> = new Map();
  private reign: ReignState = {
    current_lead_team_id: 'c_in',
    lead_start_timestamp: Date.now() - 3600 * 4 * 1000, // 4 hours ago
    duration_seconds: 14400,
  };

  constructor() {
    this.initFromLedger();
  }

  async initFromLedger() {
    try {
      const ledgerScores = await computeScoresFromLedger();
      for (const [teamId, data] of ledgerScores.entries()) {
        this.scores.set(teamId, data.cents);
      }
      this.evaluateReign();
    } catch {
      // ignore during cold start
    }
  }

  async zincrby(key: string, incrementCents: number, member: string): Promise<number> {
    const current = this.scores.get(member) || 0;
    const next = current + incrementCents;
    this.scores.set(member, next);
    this.evaluateReign(member);
    return next;
  }

  async zscore(key: string, member: string): Promise<number | null> {
    return this.scores.get(member) ?? null;
  }

  async zrevrangeWithScores(key: string, start: number, stop: number): Promise<{ member: string; score: number }[]> {
    const entries = Array.from(this.scores.entries())
      .map(([member, score]) => ({ member, score }))
      .sort((a, b) => b.score - a.score);

    const sliceStop = stop === -1 ? entries.length : stop + 1;
    return entries.slice(start, sliceStop);
  }

  evaluateReign(changedMember?: string) {
    const top = Array.from(this.scores.entries()).sort((a, b) => b[1] - a[1])[0];
    if (top && top[0] !== this.reign.current_lead_team_id) {
      const previousLead = this.reign.current_lead_team_id;
      this.reign = {
        current_lead_team_id: top[0],
        lead_start_timestamp: Date.now(),
        duration_seconds: 0,
      };

      globalEventBus.emit('live_event', {
        type: 'rank_takeover',
        data: {
          new_lead: top[0],
          previous_lead: previousLead,
          timestamp: Date.now(),
        },
      });
    }
  }

  getReign(): ReignState {
    const duration = Math.floor((Date.now() - this.reign.lead_start_timestamp) / 1000);
    return {
      ...this.reign,
      duration_seconds: Math.max(0, duration),
    };
  }
}

// Global singleton instance
const localSortedSet = new LocalSortedSet();

/**
 * Increment team score in Redis sorted set (ZINCRBY)
 */
export async function zincrby(teamId: string, amountCents: number): Promise<number> {
  if (upstashClient) {
    try {
      const newScore = await upstashClient.zincrby(REDIS_KEY, amountCents, teamId);
      return Number(newScore);
    } catch (err) {
      console.warn('Upstash error, falling back to local set:', err);
    }
  }
  return localSortedSet.zincrby(REDIS_KEY, amountCents, teamId);
}

/**
 * Get top ranked teams (ZREVRANGE with scores)
 */
export async function getTopRankedTeams(limit = 50): Promise<LeaderboardEntry[]> {
  const allTeams = await getAllTeams();
  const teamMap = new Map(allTeams.map((t) => [t.id, t]));
  const ledgerScores = await computeScoresFromLedger();

  let rankedMembers: { member: string; score: number }[] = [];

  if (upstashClient) {
    try {
      const redisResult = await upstashClient.zrange(REDIS_KEY, 0, limit - 1, { rev: true, withScores: true });
      // upstash returns array of strings or member-score pairs
      if (Array.isArray(redisResult)) {
        for (let i = 0; i < redisResult.length; i += 2) {
          if (typeof redisResult[i] === 'string' && redisResult[i + 1] !== undefined) {
            rankedMembers.push({
              member: redisResult[i] as string,
              score: Number(redisResult[i + 1]),
            });
          } else if (typeof redisResult[i] === 'object' && 'member' in (redisResult[i] as any)) {
            const item = redisResult[i] as any;
            rankedMembers.push({ member: item.member, score: Number(item.score) });
          }
        }
      }
    } catch (err) {
      console.warn('Upstash read error, falling back to local set:', err);
    }
  }

  if (rankedMembers.length === 0) {
    rankedMembers = await localSortedSet.zrevrangeWithScores(REDIS_KEY, 0, limit - 1);
  }

  // Build full leaderboard entries
  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < rankedMembers.length; i++) {
    const item = rankedMembers[i];
    const team = teamMap.get(item.member);
    if (!team) continue;

    const ledgerInfo = ledgerScores.get(item.member) || { cents: item.score, backers: 1 };
    const scoreCents = item.score;
    const prevScore = i > 0 ? rankedMembers[i - 1].score : scoreCents;
    const gap = prevScore - scoreCents;

    entries.push({
      rank: i + 1,
      team,
      score_cents: scoreCents,
      score_dollars: Math.floor(scoreCents / 100),
      backers_count: ledgerInfo.backers,
      gap_to_next: gap > 0 ? Math.ceil(gap / 100) : 0,
      is_lead: i === 0,
    });
  }

  return entries;
}

/**
 * Get current throne reign status (#1 team and time held)
 */
export async function getReignStatus(): Promise<ReignState & { team?: any }> {
  const reign = localSortedSet.getReign();
  const team = await getTeamById(reign.current_lead_team_id);
  return {
    ...reign,
    team: team || undefined,
  };
}

/**
 * Broadcast an event to all connected SSE clients
 */
export function broadcastLiveEvent(event: {
  type: 'score_update' | 'new_contribution' | 'rank_takeover';
  data: any;
}) {
  globalEventBus.emit('live_event', {
    ...event,
    timestamp: Date.now(),
  });
}

/**
 * Subscribe to the SSE event bus
 */
export function subscribeToLiveEvents(listener: (event: any) => void) {
  globalEventBus.on('live_event', listener);
  return () => {
    globalEventBus.off('live_event', listener);
  };
}

/**
 * Rebuild Redis sorted sets from the permanent ledger
 */
export async function rebuildRedisFromLedger(): Promise<{ count: number }> {
  const ledgerScores = await computeScoresFromLedger();
  let count = 0;

  for (const [teamId, data] of ledgerScores.entries()) {
    if (upstashClient) {
      try {
        await upstashClient.zadd(REDIS_KEY, { score: data.cents, member: teamId });
      } catch (err) {
        console.error('Failed zadd on rebuild:', err);
      }
    }
    // Update local set
    await localSortedSet.zincrby(REDIS_KEY, data.cents, teamId);
    count++;
  }

  return { count };
}
