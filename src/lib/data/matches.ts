// ==========================================================================
// Interfaz pública de datos para toda la app. Elige el proveedor:
//   - Si USE_MOCK !== "false" o no hay llave → datos mock (ejemplo).
//   - Si hay llave de API-Football → datos reales (con caché) y fallback a mock
//     ante cualquier error (la app nunca se queda en blanco).
//
// La UI y el motor SOLO conocen esta interfaz.
// ==========================================================================
import type { Fixture } from "./fixture";
import { MOCK_FIXTURES } from "./mock";
import { fetchFixtures, hasApiFootballKey } from "./apiFootball";

export type { Fixture } from "./fixture";

/** ¿Estamos usando datos de ejemplo (mock) en lugar de la API real? */
export function isMockMode(): boolean {
  if (process.env.USE_MOCK === "false" && hasApiFootballKey()) return false;
  return true;
}

async function loadFixtures(): Promise<Fixture[]> {
  if (isMockMode()) return MOCK_FIXTURES;
  try {
    const real = await fetchFixtures();
    return real.length > 0 ? real : MOCK_FIXTURES;
  } catch (err) {
    console.error("[data] Falló API-Football, usando mock:", err);
    return MOCK_FIXTURES;
  }
}

const within24h = (iso: string) => {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return t >= now && t <= now + 24 * 3600_000;
};

const byKickoff = (a: Fixture, b: Fixture) =>
  new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();

/**
 * Partidos "de hoy". Con datos reales históricos (temp. 2024) no hay partidos
 * en las próximas 24h, así que en ese caso mostramos los disponibles para que
 * la pantalla no quede vacía.
 */
export async function getTodayMatches(): Promise<Fixture[]> {
  const all = await loadFixtures();
  const soon = all.filter((f) => within24h(f.kickoff)).sort(byKickoff);
  return soon.length > 0 ? soon : [...all].sort(byKickoff);
}

export async function getUpcomingMatches(): Promise<Fixture[]> {
  const all = await loadFixtures();
  const now = Date.now();
  const soon = all.filter((f) => within24h(f.kickoff));
  // Si hay partidos próximos reales, "próximos" son los de más de 24h.
  // Si no (datos históricos), no duplicamos: ya se muestran en "hoy".
  if (soon.length === 0) return [];
  return all.filter((f) => new Date(f.kickoff).getTime() > now + 24 * 3600_000).sort(byKickoff);
}

export async function getAllMatches(): Promise<Fixture[]> {
  return [...(await loadFixtures())].sort(byKickoff);
}

export async function getMatchById(id: string): Promise<Fixture | undefined> {
  return (await loadFixtures()).find((f) => f.id === id);
}
