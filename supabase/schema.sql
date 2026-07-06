-- ==========================================================================
-- MagicFT — Esquema inicial de base de datos (Postgres / Supabase)
-- Sección 17 del diseño. Ejecutar en el SQL editor de Supabase o vía migración.
-- ==========================================================================

-- ---------- Catálogos deportivos ----------

create table if not exists sports (
  id          text primary key,           -- 'football', 'nba', ...
  name        text not null,
  active      boolean not null default true
);

create table if not exists leagues (
  id          bigint generated always as identity primary key,
  sport_id    text not null references sports(id),
  external_id text,                        -- id en la API deportiva
  name        text not null,
  country     text,
  season      text,
  created_at  timestamptz not null default now(),
  unique (sport_id, external_id, season)
);

create table if not exists teams (
  id          bigint generated always as identity primary key,
  sport_id    text not null references sports(id),
  league_id   bigint references leagues(id),
  external_id text,
  name        text not null,
  short_name  text,
  logo_url    text,
  created_at  timestamptz not null default now(),
  unique (sport_id, external_id)
);

create table if not exists players (
  id          bigint generated always as identity primary key,
  team_id     bigint references teams(id),
  external_id text,
  name        text not null,
  position    text,
  is_key      boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (external_id)
);

-- ---------- Partidos y datos de análisis ----------

create table if not exists matches (
  id            bigint generated always as identity primary key,
  external_id   text unique,
  sport_id      text not null references sports(id),
  league_id     bigint references leagues(id),
  home_team_id  bigint not null references teams(id),
  away_team_id  bigint not null references teams(id),
  kickoff       timestamptz not null,
  status        text not null default 'scheduled', -- scheduled|live|finished
  home_score    int,
  away_score    int,
  created_at    timestamptz not null default now()
);
create index if not exists idx_matches_kickoff on matches (kickoff);
create index if not exists idx_matches_status on matches (status);

-- Snapshot de estadísticas que alimentan al motor (una fila por equipo/partido).
create table if not exists team_stats (
  id                    bigint generated always as identity primary key,
  match_id              bigint not null references matches(id) on delete cascade,
  team_id               bigint not null references teams(id),
  is_home               boolean not null,
  form_last5_ppg        numeric,
  goals_for_per_game    numeric,
  goals_against_per_game numeric,
  table_position        int,
  league_size           int,
  rest_days             int,
  key_injuries_impact   numeric default 0,
  news_sentiment        numeric default 0,
  captured_at           timestamptz not null default now(),
  unique (match_id, team_id)
);

create table if not exists injuries (
  id          bigint generated always as identity primary key,
  team_id     bigint not null references teams(id),
  player_id   bigint references players(id),
  match_id    bigint references matches(id),
  type        text,                        -- 'injury'|'suspension'|'doubt'
  description text,
  reported_at timestamptz not null default now()
);

create table if not exists odds (
  id            bigint generated always as identity primary key,
  match_id      bigint not null references matches(id) on delete cascade,
  bookmaker     text,
  home          numeric,
  draw          numeric,
  away          numeric,
  captured_at   timestamptz not null default now()
);
create index if not exists idx_odds_match on odds (match_id, captured_at desc);

-- ---------- Predicciones, resultados y aciertos ----------

create table if not exists predictions (
  id                 bigint generated always as identity primary key,
  match_id           bigint not null references matches(id) on delete cascade,
  engine_version     text not null default 'rules-v1',
  prob_home          numeric not null,
  prob_draw          numeric not null,
  prob_away          numeric not null,
  pick               text not null,       -- 'home'|'draw'|'away'
  pick_probability   numeric not null,
  confidence_level   text not null,
  confidence_score   numeric not null,
  risk_level         text not null,
  risk_score         numeric not null,
  expected_goals     numeric,
  recommended_markets jsonb,
  value_signals      jsonb,
  explanation        text,
  created_at         timestamptz not null default now(),
  unique (match_id, engine_version)
);

create table if not exists prediction_results (
  id            bigint generated always as identity primary key,
  prediction_id bigint not null references predictions(id) on delete cascade,
  actual_outcome text,                     -- 'home'|'draw'|'away'
  hit           boolean,                   -- ¿acertó el pick?
  settled_at    timestamptz not null default now(),
  unique (prediction_id)
);

-- Métrica agregada de aciertos por versión del motor / deporte.
create table if not exists accuracy_stats (
  id             bigint generated always as identity primary key,
  engine_version text not null,
  sport_id       text not null references sports(id),
  window_label   text not null,            -- 'all'|'last_30d'|'2026-07'
  total          int not null default 0,
  hits           int not null default 0,
  hit_rate       numeric generated always as (case when total > 0 then hits::numeric / total else 0 end) stored,
  updated_at     timestamptz not null default now(),
  unique (engine_version, sport_id, window_label)
);

-- ---------- Usuarios y suscripciones ----------
-- Nota: la auth de usuarios la maneja Supabase (auth.users). Aquí guardamos
-- el perfil y la suscripción ligados a auth.users.id.

create table if not exists profiles (
  id          uuid primary key,            -- = auth.users.id
  email       text,
  display_name text,
  plan        text not null default 'free', -- free|premium|pro
  created_at  timestamptz not null default now()
);

create table if not exists subscriptions (
  id                     bigint generated always as identity primary key,
  user_id                uuid not null references profiles(id) on delete cascade,
  plan                   text not null,     -- free|premium|pro
  status                 text not null,     -- active|canceled|past_due
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now()
);
create index if not exists idx_subscriptions_user on subscriptions (user_id);

-- Registro de análisis consumidos (para límites del plan gratis).
create table if not exists usage_events (
  id         bigint generated always as identity primary key,
  user_id    uuid references profiles(id) on delete cascade,
  match_id   bigint references matches(id),
  action     text not null default 'analysis',
  created_at timestamptz not null default now()
);
create index if not exists idx_usage_user_day on usage_events (user_id, created_at);

-- Semilla de deportes.
insert into sports (id, name, active) values
  ('football', 'Fútbol', true),
  ('nba', 'NBA', false),
  ('nfl', 'NFL', false),
  ('mlb', 'MLB', false),
  ('tennis', 'Tenis', false),
  ('ufc', 'UFC', false)
on conflict (id) do nothing;
