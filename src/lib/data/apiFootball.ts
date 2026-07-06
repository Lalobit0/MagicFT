// ==========================================================================
// Conector real de API-Football (api-sports.io) → produce `Fixture[]`.
//
// PRESUPUESTO DE CONSULTAS (clave para el plan gratis de 100/día):
//   - fixtures del día:            1 consulta por liga     (caché 15 min)
//   - tabla (standings):           1 consulta por liga     (caché 6 h)
//   - estadísticas de equipo:      1 consulta por equipo   (caché 12 h)
//   - lesiones / momios / h2h:     1 consulta por partido c/u
// Una jornada típica (~9 partidos / 18 equipos) ≈ 45-50 consultas la 1ª vez,
// y 0 en cada recarga porque todo queda en caché. Miles de usuarios pueden
// leerlo sin gastar consultas extra.
//
// Si no hay llave o algo falla, quien llama hace fallback a datos mock.
// ==========================================================================
import type { MatchInput, Odds1x2, TeamStats } from "../types";
import type { Fixture } from "./fixture";
import { cached, TTL } from "./cache";

const BASE = "https://v3.football.api-sports.io";

interface LeagueCfg {
  league: number;
  season: number;
}

/** Ligas del MVP. Configurable por env: `API_FOOTBALL_LEAGUES="262:2024,39:2024"`. */
function leagues(): LeagueCfg[] {
  const raw = process.env.API_FOOTBALL_LEAGUES;
  if (raw) {
    return raw
      .split(",")
      .map((pair) => pair.split(":").map((n) => parseInt(n.trim(), 10)))
      .filter(([l, s]) => Number.isFinite(l) && Number.isFinite(s))
      .map(([league, season]) => ({ league, season }));
  }
  // Default: Liga MX (id 262), temporada actual.
  return [{ league: 262, season: new Date().getFullYear() }];
}

export function hasApiFootballKey(): boolean {
  return Boolean(process.env.API_FOOTBALL_KEY);
}

/** GET a API-Football. Devuelve `response` tal cual (array u objeto). */
async function apiGetRaw(path: string, params: Record<string, string | number>): Promise<any> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
    // Cacheado por nuestra capa; evitamos la caché de fetch de Next aquí.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API-Football ${path} → ${res.status}`);
  const json = await res.json();
  return json?.response;
}

/** Igual que apiGetRaw pero garantiza un array (para endpoints de lista). */
async function apiGet(path: string, params: Record<string, string | number>): Promise<any[]> {
  const response = await apiGetRaw(path, params);
  return Array.isArray(response) ? response : [];
}

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
};

/** Convierte una cadena de forma ("WWDLW") a puntos por partido de los últimos 5. */
function formToPpg(form: string | undefined): number {
  if (!form) return 1.5;
  const last5 = form.replace(/[^WDL]/g, "").slice(-5).split("");
  if (last5.length === 0) return 1.5;
  const pts = last5.reduce((a, r) => a + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
  return pts / last5.length;
}

// --- Consultas cacheadas por granularidad óptima ---

async function standings(cfg: LeagueCfg): Promise<{ pos: Map<number, number>; size: number }> {
  return cached(`standings:${cfg.league}:${cfg.season}`, TTL.standings, async () => {
    const resp = await apiGet("/standings", { league: cfg.league, season: cfg.season });
    const table = resp?.[0]?.league?.standings?.[0] ?? [];
    const pos = new Map<number, number>();
    for (const row of table) pos.set(row.team.id, row.rank);
    return { pos, size: table.length || 18 };
  });
}

async function teamStats(cfg: LeagueCfg, teamId: number) {
  return cached(`teamstats:${cfg.league}:${cfg.season}:${teamId}`, TTL.teamStats, () =>
    // /teams/statistics devuelve un OBJETO en `response`, por eso usamos Raw.
    apiGetRaw("/teams/statistics", { league: cfg.league, season: cfg.season, team: teamId })
  );
}

async function injuriesCount(fixtureId: number): Promise<Map<number, number>> {
  return cached(`injuries:${fixtureId}`, TTL.injuries, async () => {
    const resp = await apiGet("/injuries", { fixture: fixtureId });
    const byTeam = new Map<number, number>();
    for (const row of resp) {
      const id = row?.team?.id;
      if (id != null) byTeam.set(id, (byTeam.get(id) ?? 0) + 1);
    }
    return byTeam;
  });
}

async function odds1x2(fixtureId: number): Promise<Odds1x2 | undefined> {
  return cached(`odds:${fixtureId}`, TTL.odds, async () => {
    const resp = await apiGet("/odds", { fixture: fixtureId });
    const bets = resp?.[0]?.bookmakers?.[0]?.bets ?? [];
    const winner = bets.find((b: any) => /match winner|1x2/i.test(b?.name ?? ""));
    if (!winner) return undefined;
    const get = (label: string) =>
      num(winner.values.find((v: any) => new RegExp(`^${label}$`, "i").test(v.value))?.odd);
    const home = get("Home");
    const draw = get("Draw");
    const away = get("Away");
    if (!home || !draw || !away) return undefined;
    return { home, draw, away };
  });
}

async function h2hHomeWinRate(homeId: number, awayId: number): Promise<{ rate: number; n: number }> {
  return cached(`h2h:${homeId}:${awayId}`, TTL.standings, async () => {
    const resp = await apiGet("/fixtures/headtohead", { h2h: `${homeId}-${awayId}`, last: 10 });
    let wins = 0;
    let n = 0;
    for (const fx of resp) {
      const h = fx?.teams?.home;
      const a = fx?.teams?.away;
      if (!h || !a) continue;
      n++;
      // ¿Ganó el equipo que hoy es local (homeId), sin importar dónde jugó antes)?
      if ((h.id === homeId && h.winner) || (a.id === homeId && a.winner)) wins++;
    }
    return { rate: n > 0 ? wins / n : 0.5, n };
  });
}

function buildTeamStats(
  teamId: number,
  name: string,
  stats: any,
  pos: number,
  leagueSize: number,
  injuries: number
): TeamStats {
  return {
    teamId: String(teamId),
    name,
    formLast5Ppg: formToPpg(stats?.form),
    goalsForPerGame: num(stats?.goals?.for?.average?.total, 1.2),
    goalsAgainstPerGame: num(stats?.goals?.against?.average?.total, 1.2),
    tablePosition: pos || Math.ceil(leagueSize / 2),
    leagueSize,
    restDays: 4, // TODO: derivar del último partido; neutral por ahora
    keyInjuriesImpact: Math.min(injuries, 3),
    newsSentiment: 0, // TODO: integrar noticias (módulo aparte)
  };
}

async function mapFixture(cfg: LeagueCfg, fx: any): Promise<Fixture | null> {
  try {
    const fixtureId = fx.fixture.id;
    const homeTeam = fx.teams.home;
    const awayTeam = fx.teams.away;

    const [table, homeStatsRaw, awayStatsRaw, inj, odds, h2h] = await Promise.all([
      standings(cfg),
      teamStats(cfg, homeTeam.id),
      teamStats(cfg, awayTeam.id),
      injuriesCount(fixtureId),
      odds1x2(fixtureId),
      h2hHomeWinRate(homeTeam.id, awayTeam.id),
    ]);

    const home = buildTeamStats(
      homeTeam.id,
      homeTeam.name,
      homeStatsRaw,
      table.pos.get(homeTeam.id) ?? 0,
      table.size,
      inj.get(homeTeam.id) ?? 0
    );
    const away = buildTeamStats(
      awayTeam.id,
      awayTeam.name,
      awayStatsRaw,
      table.pos.get(awayTeam.id) ?? 0,
      table.size,
      inj.get(awayTeam.id) ?? 0
    );

    const input: MatchInput = {
      sport: "football",
      home,
      away,
      context: {
        competitionImportance: 0.5,
        h2hHomeWinRate: h2h.rate,
        h2hSampleSize: h2h.n,
      },
      odds,
    };

    const statusShort = fx.fixture.status?.short ?? "NS";
    const status: Fixture["status"] =
      statusShort === "FT" ? "finished" : ["1H", "2H", "HT", "LIVE"].includes(statusShort)
        ? "live"
        : "scheduled";

    return {
      id: `af-${fixtureId}`,
      sport: "football",
      league: fx.league?.name ?? "Fútbol",
      kickoff: fx.fixture.date,
      status,
      input,
    };
  } catch {
    return null; // partido individual falló → se omite, no rompe la lista
  }
}

/** Partidos de las próximas 24 h desde API-Football. */
export async function fetchFixtures(): Promise<Fixture[]> {
  const today = new Date().toISOString().slice(0, 10);
  const all: Fixture[] = [];
  for (const cfg of leagues()) {
    const raw = await cached(`fixtures:${cfg.league}:${today}`, TTL.fixtures, () =>
      apiGet("/fixtures", { league: cfg.league, season: cfg.season, date: today })
    );
    const mapped = await Promise.all(raw.map((fx) => mapFixture(cfg, fx)));
    for (const f of mapped) if (f) all.push(f);
  }
  return all.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}
