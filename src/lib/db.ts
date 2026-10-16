import fs from 'fs';
import path from 'path';
import { Team, Payment, WaitlistPledge, SeasonState } from './types';
import { INITIAL_TEAMS, INITIAL_SEED_PLEDGES } from './seed-data';

interface DatabaseStore {
  teams: Team[];
  payments: Payment[];
  waitlist: WaitlistPledge[];
  season: SeasonState;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'dollarwar-store.json');

// Default initial state
function getDefaultState(): DatabaseStore {
  // Season ends 7 days from now by default for active viral countdown
  const now = Date.now();
  const endsAt = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
  const startsAt = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();

  // Create initial demo payments so the board is vibrant upon launch
  const initialPayments: Payment[] = [
    {
      id: 'pay_init_1',
      provider: 'mock',
      provider_session_id: 'sess_init_in_1',
      team_id: 'c_in',
      amount_cents: 25000, // $250
      status: 'completed',
      contributor_name: 'Aarav Sharma',
      handle: 'aarav_sharma',
      message: 'India to #1! Let’s show the world 🇮🇳🚀',
      created_at: new Date(now - 14000000).toISOString(),
    },
    {
      id: 'pay_init_2',
      provider: 'mock',
      provider_session_id: 'sess_init_us_1',
      team_id: 'c_us',
      amount_cents: 21000, // $210
      status: 'completed',
      contributor_name: 'Logan Vance',
      handle: 'logan_v',
      message: 'USA won’t stay #2 for long 🦅🇺🇸',
      created_at: new Date(now - 12000000).toISOString(),
    },
    {
      id: 'pay_init_3',
      provider: 'mock',
      provider_session_id: 'sess_init_gb_1',
      team_id: 'c_gb',
      amount_cents: 14000, // $140
      status: 'completed',
      contributor_name: 'Oliver Clarke',
      handle: 'oclarke_uk',
      message: 'Rule Britannia! Backing London & UK 🇬🇧',
      created_at: new Date(now - 9000000).toISOString(),
    },
    {
      id: 'pay_init_4',
      provider: 'mock',
      provider_session_id: 'sess_init_blr_1',
      team_id: 'cty_blr',
      amount_cents: 12500, // $125
      status: 'completed',
      contributor_name: 'Priya Narang',
      handle: 'priya_tech',
      message: 'Silicon Valley of the East representing Bengaluru! 🚀',
      created_at: new Date(now - 7000000).toISOString(),
    },
    {
      id: 'pay_init_5',
      provider: 'mock',
      provider_session_id: 'sess_init_mh_1',
      team_id: 's_mh',
      amount_cents: 11000, // $110
      status: 'completed',
      contributor_name: 'Rohan Patil',
      handle: 'rohan_mh',
      message: 'Maharashtra titan state backing! 🚩',
      created_at: new Date(now - 5000000).toISOString(),
    },
    {
      id: 'pay_init_6',
      provider: 'mock',
      provider_session_id: 'sess_init_nyc_1',
      team_id: 'cty_nyc',
      amount_cents: 9500, // $95
      status: 'completed',
      contributor_name: 'Sarah Jenkins',
      handle: 'sarah_nyc',
      message: 'NYC never sleeps 🗽',
      created_at: new Date(now - 3000000).toISOString(),
    },
    {
      id: 'pay_init_7',
      provider: 'mock',
      provider_session_id: 'sess_init_dxb_1',
      team_id: 'cty_dxb',
      amount_cents: 8000, // $80
      status: 'completed',
      contributor_name: 'Tariq Al-Maktoum',
      handle: 'tariq_dxb',
      message: 'Dubai to the moon 🏙️✨',
      created_at: new Date(now - 1200000).toISOString(),
    },
    {
      id: 'pay_init_8',
      provider: 'mock',
      provider_session_id: 'sess_init_tok_1',
      team_id: 'cty_tok',
      amount_cents: 7500, // $75
      status: 'completed',
      contributor_name: 'Kenji Sato',
      handle: 'kenji_tokyo',
      message: 'Tokyo spirit! 🗼🇯🇵',
      created_at: new Date(now - 450000).toISOString(),
    },
  ];

  return {
    teams: INITIAL_TEAMS,
    payments: initialPayments,
    waitlist: INITIAL_SEED_PLEDGES.map((p, i) => ({
      id: `wl_${i + 1}`,
      ...p,
    })),
    season: {
      season_number: 1,
      title: 'Season 1: Genesis War',
      starts_at: startsAt,
      ends_at: endsAt,
      is_frozen: false,
    },
  };
}

// In-memory cache for ultra-fast response
let memoryStore: DatabaseStore | null = null;

function loadStore(): DatabaseStore {
  if (memoryStore) return memoryStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      // Ensure seed teams match latest if new ones were added
      if (memoryStore && memoryStore.teams.length < INITIAL_TEAMS.length) {
        const existingIds = new Set(memoryStore.teams.map((t) => t.id));
        const missing = INITIAL_TEAMS.filter((t) => !existingIds.has(t.id));
        memoryStore.teams.push(...missing);
      }
    } else {
      memoryStore = getDefaultState();
      saveStore(memoryStore);
    }
  } catch (err) {
    console.error('Failed reading store file, falling back to in-memory state:', err);
    memoryStore = getDefaultState();
  }

  if (!memoryStore) {
    memoryStore = getDefaultState();
  }

  return memoryStore;
}

function saveStore(store: DatabaseStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing store file:', err);
  }
}

// Data Layer APIs
export async function getAllTeams(): Promise<Team[]> {
  const store = loadStore();
  return store.teams;
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const store = loadStore();
  const normalized = slug.toLowerCase().trim();
  return store.teams.find((t) => t.slug === normalized) || null;
}

export async function getTeamById(id: string): Promise<Team | null> {
  const store = loadStore();
  return store.teams.find((t) => t.id === id) || null;
}

/**
 * Record a payment into the append-only ledger.
 * Strictly guarantees idempotency via unique provider_session_id.
 */
export async function recordPayment(paymentInput: {
  provider: 'stripe' | 'razorpay' | 'mock';
  provider_session_id: string;
  team_id: string;
  amount_cents: number;
  contributor_name: string;
  handle?: string;
  message?: string;
  referral_slug?: string;
}): Promise<{ payment: Payment; isNew: boolean }> {
  const store = loadStore();

  // 1. Season check
  if (store.season.is_frozen || new Date() > new Date(store.season.ends_at)) {
    throw new Error('Season has ended. Payments are frozen for this season.');
  }

  // 2. Strict idempotency check
  const existing = store.payments.find(
    (p) => p.provider_session_id === paymentInput.provider_session_id
  );
  if (existing) {
    return { payment: existing, isNew: false };
  }

  // 3. Team check
  const team = store.teams.find((t) => t.id === paymentInput.team_id);
  if (!team) {
    throw new Error(`Team with id ${paymentInput.team_id} does not exist.`);
  }

  // 4. Create new ledger row
  const payment: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    provider: paymentInput.provider,
    provider_session_id: paymentInput.provider_session_id,
    team_id: paymentInput.team_id,
    amount_cents: Math.max(100, Math.floor(paymentInput.amount_cents)), // minimum $1 (100 cents)
    status: 'completed',
    contributor_name: paymentInput.contributor_name.trim() || 'Anonymous Backer',
    handle: paymentInput.handle ? paymentInput.handle.trim().replace(/^@/, '') : undefined,
    message: paymentInput.message ? paymentInput.message.trim().slice(0, 200) : undefined,
    referral_slug: paymentInput.referral_slug,
    created_at: new Date().toISOString(),
  };

  store.payments.push(payment);
  saveStore(store);

  return { payment, isNew: true };
}

/**
 * "Never store a score; compute it from paid rows."
 * Returns Map<team_id, { cents: number, backers: number }>
 */
export async function computeScoresFromLedger(): Promise<Map<string, { cents: number; backers: number }>> {
  const store = loadStore();
  const scores = new Map<string, { cents: number; backers: number }>();

  // Initialize all teams
  for (const team of store.teams) {
    scores.set(team.id, { cents: 0, backers: 0 });
  }

  // Sum completed payment rows
  for (const pay of store.payments) {
    if (pay.status === 'completed') {
      const cur = scores.get(pay.team_id) || { cents: 0, backers: 0 };
      scores.set(pay.team_id, {
        cents: cur.cents + pay.amount_cents,
        backers: cur.backers + 1,
      });
    } else if (pay.status === 'refunded') {
      // Refunds reduce ledger score
      const cur = scores.get(pay.team_id) || { cents: 0, backers: 0 };
      scores.set(pay.team_id, {
        cents: Math.max(0, cur.cents - pay.amount_cents),
        backers: cur.backers,
      });
    }
  }

  return scores;
}

export async function getRecentContributions(limit = 20): Promise<Payment[]> {
  const store = loadStore();
  return [...store.payments]
    .filter((p) => p.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function recordWaitlistPledge(input: {
  team_id: string;
  email: string;
  pledged_cents?: number;
  handle?: string;
}): Promise<WaitlistPledge> {
  const store = loadStore();
  const team = store.teams.find((t) => t.id === input.team_id);
  if (!team) throw new Error('Invalid team selected');

  const pledge: WaitlistPledge = {
    id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    team_id: input.team_id,
    email: input.email.toLowerCase().trim(),
    pledged_cents: input.pledged_cents || 100,
    handle: input.handle?.trim().replace(/^@/, ''),
    created_at: new Date().toISOString(),
  };

  store.waitlist.push(pledge);
  saveStore(store);
  return pledge;
}

export async function getWaitlistStats(): Promise<{
  total_pledges: number;
  total_dollars: number;
  target_goal: number;
  team_breakdown: { team: Team; count: number; dollars: number }[];
}> {
  const store = loadStore();
  const counts = new Map<string, { count: number; dollars: number }>();

  for (const p of store.waitlist) {
    const cur = counts.get(p.team_id) || { count: 0, dollars: 0 };
    counts.set(p.team_id, {
      count: cur.count + 1,
      dollars: cur.dollars + p.pledged_cents / 100,
    });
  }

  const team_breakdown = Array.from(counts.entries())
    .map(([team_id, data]) => {
      const team = store.teams.find((t) => t.id === team_id)!;
      return {
        team,
        count: data.count,
        dollars: data.dollars,
      };
    })
    .filter((entry) => Boolean(entry.team))
    .sort((a, b) => b.count - a.count);

  const total_pledges = store.waitlist.length;
  const total_dollars = store.waitlist.reduce((sum, p) => sum + p.pledged_cents / 100, 0);

  return {
    total_pledges,
    total_dollars,
    target_goal: 500, // From step 1: "Continue only if about 500 people pre-commit $1 within a week"
    team_breakdown,
  };
}

export async function getSeasonState(): Promise<SeasonState> {
  const store = loadStore();
  return store.season;
}

export async function freezeSeason(): Promise<SeasonState> {
  const store = loadStore();
  store.season.is_frozen = true;
  store.season.frozen_at = new Date().toISOString();
  saveStore(store);
  return store.season;
}
