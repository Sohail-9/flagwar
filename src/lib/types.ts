export type TeamType = 'country' | 'state' | 'city';

export interface Team {
  id: string;
  name: string;
  slug: string;
  type: TeamType;
  code: string; // ISO-2 or short code
  flag: string; // Emoji flag or custom symbol
  region?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  provider: 'stripe' | 'razorpay' | 'mock';
  provider_session_id: string; // UNIQUE constraint
  team_id: string;
  amount_cents: number; // e.g. 100 for $1.00
  status: 'completed' | 'refunded' | 'pending';
  contributor_name: string;
  handle?: string;
  message?: string;
  referral_slug?: string;
  created_at: string;
}

export interface WaitlistPledge {
  id: string;
  team_id: string;
  email: string;
  pledged_cents: number;
  handle?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  team: Team;
  score_cents: number;
  score_dollars: number;
  backers_count: number;
  mobilization_score: number; // Backers * sqrt(Dollars)
  stars_count: number;
  gap_to_next?: number;
  is_lead?: boolean;
}

export interface CitizenPass {
  id: string;
  citizen_number: number;
  contributor_name: string;
  handle?: string;
  team: Team;
  rank_tier: 'Commander' | 'Centurion' | 'Guardian' | 'Defender';
  amount_dollars: number;
  message?: string;
  created_at: string;
  referral_url: string;
}

export interface ReignState {
  current_lead_team_id: string;
  lead_start_timestamp: number; // ms
  duration_seconds: number;
}

export interface SeasonState {
  season_number: number;
  title: string;
  starts_at: string;
  ends_at: string;
  is_frozen: boolean;
  frozen_at?: string;
}

export interface ContributionEvent {
  id: string;
  team_id: string;
  team_name: string;
  team_flag: string;
  team_slug: string;
  amount_dollars: number;
  contributor: string;
  handle?: string;
  message?: string;
  timestamp: number;
}
