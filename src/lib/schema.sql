-- ==========================================
-- Dollar War / Flag War Database Schema (Postgres / Supabase)
-- ==========================================

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('country', 'state', 'city')),
    code VARCHAR(16) NOT NULL,
    flag VARCHAR(32) NOT NULL,
    region VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_type ON teams(type);

-- 2. Payments Append-Only Ledger
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    provider_session_id VARCHAR(255) NOT NULL UNIQUE, -- Crucial: strict idempotency
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'pending')),
    contributor_name VARCHAR(128) NOT NULL,
    handle VARCHAR(64),
    message TEXT,
    referral_slug VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_team_id ON payments(team_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- 3. Waitlist Pledges (Step 1 Demand Validation)
CREATE TABLE IF NOT EXISTS waitlist_pledges (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    email VARCHAR(255) NOT NULL,
    pledged_cents INTEGER NOT NULL DEFAULT 100,
    handle VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_team_id ON waitlist_pledges(team_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_pledges(email);

-- 4. Season State & Frozen Archives
CREATE TABLE IF NOT EXISTS seasons (
    season_number INTEGER PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_frozen BOOLEAN DEFAULT FALSE,
    frozen_board_json JSONB,
    frozen_at TIMESTAMPTZ
);
