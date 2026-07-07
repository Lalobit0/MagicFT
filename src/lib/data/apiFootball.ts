// ==========================================================================
// Conector real de API-Football (api-sports.io) → produce `Fixture[]`.
//
// PLAN GRATIS: solo cubre temporadas 2022-2024 y bloquea el parámetro "next".
// Por eso, por defecto, traemos partidos REALES de una ventana de la temporada
// 2024 (datos verdaderos: equipos, estadísticas, tabla). Para partidos en vivo
// se requiere un plan de pago: bastaría cambiar API_FOOTBALL_LEAGUES a la
// temporada actual y API_FOOTBALL_FROM/TO a fechas próximas.
//
// PRESUPUESTO DE CONSULTAS (para el límite de 100/día del plan gratis):
//   - fixtures de la ventana:  1 consulta por liga     (caché 15 min)
//   - tabla (standings):       1 consulta por liga     (caché 6 h)
//   - estadísticas de equipo:  1 consulta por equipo   (caché 12 h)
//   - lesiones / momios / h2h: 1 consulta por partido c/u (tolerante a fallos)
// Cada pieza se cachea y tolera errores: si el plan no da momios, el partido
// igual se muestra (solo sin comparación de valor).
// ==========================================================================
import type { MatchInput, Odds1x2, TeamStats } from "../types";
import type { Fixture } from "./fixture";
import { cached, TTL } from "./cache";

const BASE = "https://v3.football.api-sports.io";

interface LeagueCfg {
  league: number;
  season: number;
}

/** Ligas del MVP. Configurable: `API_FOOTBALL_LEAGUES="262:2024"`. */
function leagues(): LeagueCfg[] {
  const raw = process.env.API_FOOTBALL_LEAGUES;
  if (raw) {
    return raw
      .split(",")
      .map((pair) => pair.split(":").map((n) => parseInt(n.trim(), 10)))
      .filter(([l, s]) => Number.isFinite(l) && Number.isFinite(s))
      .map(([league, season]) => ({ league, season }));
  }
  return [{ league: 262, season: 2024 }];
}

/** Ventana de fechas a consultar. Por defecto, una jornada real de la temp. 2024. */
function dateWindow(): { from: string; to: string } {
  return {
    from: process.env.API_FOOTBALL_FROM ?? "2024-11-01",
    to: process.env.API_FOOTBALL_TO ?? "2024-11-30",
  };
}

/** Máximo de partidos a procesar (protege el presupuesto de consultas). */
function maxFixtures(): number {
  const n = parseInt(process.env.API_FOOTBALL_MAX_FIXTURES ?? "8", 10);
  return Number.isFinite(n) && n > 0 ? n : 8;
}

export function hasApiFootballKey(): boolean {
  return Boolean(process.env.API_FOOTBALL_KEY);
}

async function apiGetRaw(path: string, params: Record<string, string | number>): Promise<any> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API-Football ${path} → ${res.status}`);
  const json = await res.json();
  return json?.response;
}

async function apiGet(path: string, params: Record<string, string | number>): Promise<any[]> {
  const response = await apiGetRaw(path, params);
  return Array.isArray(response) ? response : [];
}

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
};

/** Cadena de forma ("WWDLW") → puntos por partido de los últimos 5. */
function formToPpg(form: string | undefined): number {
  if (!form) return 1.5;
  const last5 = form.replace(/[^WDL]/g, "").slice(-5).split("");
  if (last5.length === 0) return 1.5;
  const pts = last5.reduce((a, r) => a + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
  return pts / last5.length;
}

// --- Consultas cacheadas y TOLERANTES A FALLOS (devuelven default si algo falla) ---

async function standings(cfg: LeagueCfg): Promise<{ pos: Map<number, number>; size: number }> {
  return cached(`standings:${cfg.league}:${cfg.season}`, TTL.standings, async () => {
    try {
      const resp = await apiGet("/standings", { league: cfg.league, season: cfg.season });
      const table = resp?.[0]?.league?.standings?.[0] ?? [];
      const pos = new Map<number, number>();
      for (const row of table) pos.set(row.team.id, row.rank);
      return { pos, size: table.length || 18 };
    } catch {
      return { pos: new Map<number, number>(), size: 18 };
    }
  });
}

async function teamStats(cfg: LeagueCfg, teamId: number): Promise<any> {
  return cached(`teamstats:${cfg.league}:${cfg.season}:${teamId}`, TTL.teamStats, async () => {
    try {
      return await apiGetRaw("/teams/statistics", {
        league: cfg.league,
        season: cfg.season,
        team: teamId,
      });
    } catch {
      return {};
    }
  });
}

async function injuriesCount(fixtureId: number): Promise<Map<number, number>> {
  return cached(`injuries:${fixtureId}`, TTL.injuries, async () => {
    const byTeam = new Map<number, number>();
    try {
      const resp = await apiGet("/injuries", { fixture: fixtureId });
      for (const row of resp) {
        const id = row?.team?.id;
        if (id != null) byTeam.set(id, (byTeam.get(id) ?? 0) + 1);
      }
    } catch {
      /* sin lesiones disponibles → 0 */
    }
    return byTeam;
  });
}

async function odds1x2(fixtureId: number): Promise<Odds1x2 | undefined> {
  return cached(`odds:${fixtureId}`, TTL.odds, async () => {
    try {
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
    } catch {
      return undefined;
    }
  });
}

async function h2hHomeWinRate(homeId: number, awayId: number): Promise<{ rate: number; n: number }> {
  return cached(`h2h:${homeId}:${awayId}`, TTL.standings, async () => {
    try {
      const resp = await apiGet("/fixtures/headtohead", { h2h: `${homeId}-${awayId}`, last: 10 });
      let wins = 0;
      let n = 0;
      for (const fx of resp) {
        const h = fx?.teams?.home;
        const a = fx?.teams?.away;
        if (!h || !a) continue;
        n++;
        if ((h.id === homeId && h.winner) || (a.id === homeId && a.winner)) wins++;
      }
      return { rate: n > 0 ? wins / n : 0.5, n };
    } catch {
      return { rate: 0.5, n: 0 };
    }
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
    restDays: 4,
    keyInjuriesImpact: Math.min(injuries, 3),
    newsSentiment: 0,
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
      statusShort === "FT"
        ? "finished"
        : ["1H", "2H", "HT", "LIVE"].includes(statusShort)
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
    return null;
  }
}

/** Trae partidos reales de la ventana/temporada configurada. */
export async function fetchFixtures(): Promise<Fixture[]> {
  const { from, to } = dateWindow();
  const cap = maxFixtures();
  const all: Fixture[] = [];

  for (const cfg of leagues()) {
    let raw: any[] = [];
    try {
      raw = await cached(`fixtures:${cfg.league}:${cfg.season}:${from}:${to}`, TTL.fixtures, () =>
        apiGet("/fixtures", { league: cfg.league, season: cfg.season, from, to })
      );
    } catch (e) {
      console.error("[api-football] error trayendo fixtures:", e);
      continue;
    }

    // Tomamos los MÁS RECIENTES de la ventana, limitados por presupuesto.
    const recent = raw
      .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
      .slice(0, cap);

    const mapped = await Promise.all(recent.map((fx) => mapFixture(cfg, fx)));
    for (const f of mapped) if (f) all.push(f);
  }

  console.log(`[api-football] fixtures reales mapeados: ${all.length}`);
  return all.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}
