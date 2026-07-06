// ==========================================================================
// Interfaz pública de datos para toda la app. Elige el proveedor:
//   - Si USE_MOCK !== "false" o no hay llave de API → datos mock.
//   - Si hay llave de API-Football → datos reales (con caché) y fallback a mock
//     ante cualquier error (la app nunca se queda en blanco).
//
// La UI y el motor SOLO conocen esta interfaz, así que cambiar/mezclar
// proveedores no toca el resto del código.
// ==========================================================================
import type { Fixture } from "./fixture";
import { MOCK_FIXTURES } from "./mock";
import { fetchFixtures, hasApiFootballKey } from "./apiFootball";

export type { Fixture } from "./fixture";

function useMock(): boolean {
  // Mock salvo que se pida explícitamente lo real Y exista la llave.
  if (process.env.USE_MOCK === "false" && hasApiFootballKey()) return false;
  return true;
}

/** Devuelve todos los partidos disponibles del proveedor activo. */
async function loadFixtures(): Promise<Fixture[]> {
  if (useMock()) return MOCK_FIXTURES;
  try {
    const real = await fetchFixtures();
    // Si la API no trajo nada (sin partidos hoy), mostramos mock para no dejar
    // la pantalla vacía en la demo. En producción devolverías [] con un estado.
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

export async function getTodayMatches(): Promise<Fixture[]> {
  return (await loadFixtures()).filter((f) => within24h(f.kickoff));
}

export async function getUpcomingMatches(): Promise<Fixture[]> {
  const now = Date.now();
  return (await loadFixtures()).filter((f) => new Date(f.kickoff).getTime() > now + 24 * 3600_000);
}

export async function getAllMatches(): Promise<Fixture[]> {
  return (await loadFixtures()).sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );
}

export async function getMatchById(id: string): Promise<Fixture | undefined> {
  return (await loadFixtures()).find((f) => f.id === id);
}
