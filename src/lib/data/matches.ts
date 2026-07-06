// ==========================================================================
// Capa de datos. En modo mock devuelve fixtures de ejemplo.
// Cuando integres API-Football, implementa las mismas funciones leyendo la API
// y mapeando la respuesta a `Fixture` (misma interfaz → cero cambios en la UI).
// Ver docs/02-apis-deportivas.md
// ==========================================================================
import type { MatchInput, Sport } from "../types";

export interface Fixture {
  id: string;
  sport: Sport;
  league: string;
  /** ISO string del inicio del partido. */
  kickoff: string;
  status: "scheduled" | "live" | "finished";
  input: MatchInput;
}

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

// --------------------------------------------------------------------------
// Fixtures de ejemplo (los 4 escenarios de la Sección 11 + extras).
// --------------------------------------------------------------------------
const FIXTURES: Fixture[] = [
  // 1) FAVORITO CLARO
  {
    id: "amex-vs-qro",
    sport: "football",
    league: "Liga MX",
    kickoff: hoursFromNow(3),
    status: "scheduled",
    input: {
      sport: "football",
      home: {
        teamId: "ame",
        name: "Club América",
        formLast5Ppg: 2.6,
        goalsForPerGame: 2.4,
        goalsAgainstPerGame: 0.8,
        tablePosition: 1,
        leagueSize: 18,
        restDays: 4,
        keyInjuriesImpact: 0,
        newsSentiment: 0.3,
      },
      away: {
        teamId: "qro",
        name: "Querétaro",
        formLast5Ppg: 0.8,
        goalsForPerGame: 0.9,
        goalsAgainstPerGame: 2.1,
        tablePosition: 16,
        leagueSize: 18,
        restDays: 3,
        keyInjuriesImpact: 1,
        newsSentiment: -0.2,
      },
      context: { competitionImportance: 0.5, h2hHomeWinRate: 0.7, h2hSampleSize: 8 },
      odds: { home: 1.4, draw: 4.5, away: 7.5, homeLineMovePct: -3 },
    },
  },

  // 2) PARTIDO PAREJO (clásico regio)
  {
    id: "mty-vs-tig",
    sport: "football",
    league: "Liga MX",
    kickoff: hoursFromNow(6),
    status: "scheduled",
    input: {
      sport: "football",
      home: {
        teamId: "mty",
        name: "Monterrey",
        formLast5Ppg: 2.0,
        goalsForPerGame: 1.8,
        goalsAgainstPerGame: 1.1,
        tablePosition: 3,
        leagueSize: 18,
        restDays: 4,
        keyInjuriesImpact: 0,
        newsSentiment: 0,
      },
      away: {
        teamId: "tig",
        name: "Tigres UANL",
        formLast5Ppg: 2.0,
        goalsForPerGame: 1.7,
        goalsAgainstPerGame: 1.0,
        tablePosition: 4,
        leagueSize: 18,
        restDays: 4,
        keyInjuriesImpact: 0,
        newsSentiment: 0.1,
      },
      context: { competitionImportance: 0.7, h2hHomeWinRate: 0.45, h2hSampleSize: 10 },
      odds: { home: 2.3, draw: 3.2, away: 3.1 },
    },
  },

  // 3) RIESGOSO — la app recomienda NO apostar (sin momios, bajas, clima)
  {
    id: "caz-vs-pum",
    sport: "football",
    league: "Liga MX",
    kickoff: hoursFromNow(9),
    status: "scheduled",
    input: {
      sport: "football",
      home: {
        teamId: "caz",
        name: "Cruz Azul",
        formLast5Ppg: 1.4,
        goalsForPerGame: 1.3,
        goalsAgainstPerGame: 1.4,
        tablePosition: 9,
        leagueSize: 18,
        restDays: 2,
        keyInjuriesImpact: 2,
        newsSentiment: -0.3,
      },
      away: {
        teamId: "pum",
        name: "Pumas UNAM",
        formLast5Ppg: 1.5,
        goalsForPerGame: 1.5,
        goalsAgainstPerGame: 1.5,
        tablePosition: 8,
        leagueSize: 18,
        restDays: 2,
        keyInjuriesImpact: 1,
        newsSentiment: 0,
      },
      context: {
        competitionImportance: 0.4,
        h2hHomeWinRate: 0.5,
        h2hSampleSize: 2,
        adverseWeather: true,
      },
      // Sin momios a propósito → baja completitud de datos.
    },
  },

  // 4) EL GANADOR NO ES LA MEJOR OPCIÓN → mercado alternativo (muchos goles)
  {
    id: "gdl-vs-leo",
    sport: "football",
    league: "Liga MX",
    kickoff: hoursFromNow(4),
    status: "scheduled",
    input: {
      sport: "football",
      home: {
        teamId: "gdl",
        name: "Guadalajara",
        formLast5Ppg: 2.2,
        goalsForPerGame: 2.3,
        goalsAgainstPerGame: 1.6,
        tablePosition: 5,
        leagueSize: 18,
        restDays: 5,
        keyInjuriesImpact: 0,
        newsSentiment: 0.2,
      },
      away: {
        teamId: "leo",
        name: "León",
        formLast5Ppg: 1.9,
        goalsForPerGame: 2.1,
        goalsAgainstPerGame: 1.7,
        tablePosition: 6,
        leagueSize: 18,
        restDays: 3,
        keyInjuriesImpact: 1,
        newsSentiment: 0,
      },
      context: { competitionImportance: 0.6, h2hHomeWinRate: 0.55, h2hSampleSize: 9 },
      odds: { home: 2.05, draw: 3.4, away: 3.5 },
    },
  },

  // Extra para "próximos partidos" (mañana)
  {
    id: "tol-vs-pue",
    sport: "football",
    league: "Liga MX",
    kickoff: hoursFromNow(28),
    status: "scheduled",
    input: {
      sport: "football",
      home: {
        teamId: "tol",
        name: "Toluca",
        formLast5Ppg: 2.4,
        goalsForPerGame: 2.5,
        goalsAgainstPerGame: 1.3,
        tablePosition: 2,
        leagueSize: 18,
        restDays: 6,
        keyInjuriesImpact: 0,
        newsSentiment: 0.25,
      },
      away: {
        teamId: "pue",
        name: "Puebla",
        formLast5Ppg: 1.0,
        goalsForPerGame: 1.1,
        goalsAgainstPerGame: 2.0,
        tablePosition: 15,
        leagueSize: 18,
        restDays: 4,
        keyInjuriesImpact: 1,
        newsSentiment: -0.1,
      },
      context: { competitionImportance: 0.5, h2hHomeWinRate: 0.6, h2hSampleSize: 7 },
      odds: { home: 1.6, draw: 4.0, away: 5.5 },
    },
  },
];

/** Partidos que arrancan en las próximas 24 horas. */
export async function getTodayMatches(): Promise<Fixture[]> {
  const now = Date.now();
  return FIXTURES.filter((f) => {
    const t = new Date(f.kickoff).getTime();
    return t >= now && t <= now + 24 * 3600_000;
  });
}

/** Partidos que arrancan después de las próximas 24 horas. */
export async function getUpcomingMatches(): Promise<Fixture[]> {
  const now = Date.now();
  return FIXTURES.filter((f) => new Date(f.kickoff).getTime() > now + 24 * 3600_000);
}

export async function getAllMatches(): Promise<Fixture[]> {
  return [...FIXTURES].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );
}

export async function getMatchById(id: string): Promise<Fixture | undefined> {
  return FIXTURES.find((f) => f.id === id);
}
