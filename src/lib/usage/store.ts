// ==========================================================================
// Almacén de uso (para el límite del plan gratis).
//
// DEMO: guarda en memoria. En producción esto va a la tabla `usage_events` de
// Supabase (misma forma: usuario + partido + día). La lógica de arriba
// (quota.ts) no cambia al migrar: solo se reemplaza este archivo por llamadas
// a Supabase.
//
// Idempotencia: registramos por (usuario, partido, día). Volver a abrir el
// MISMO partido el mismo día NO consume otro análisis (y evita que un refresh
// gaste cuota).
// ==========================================================================

type DayKey = string; // `${uid}:${YYYY-MM-DD}`

// Persistimos en globalThis para sobrevivir al hot-reload de Next en dev.
const globalStore = globalThis as unknown as {
  __mftUsage?: Map<DayKey, Set<string>>;
};
const store: Map<DayKey, Set<string>> = (globalStore.__mftUsage ??= new Map());

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function keyFor(uid: string): DayKey {
  return `${uid}:${todayUTC()}`;
}

/** Conjunto de partidos ya analizados hoy por este usuario. */
export function analyzedMatchesToday(uid: string): Set<string> {
  return store.get(keyFor(uid)) ?? new Set();
}

export function hasAnalyzed(uid: string, matchId: string): boolean {
  return analyzedMatchesToday(uid).has(matchId);
}

export function analysesUsedToday(uid: string): number {
  return analyzedMatchesToday(uid).size;
}

/** Registra un análisis (idempotente por partido/día). */
export function recordAnalysis(uid: string, matchId: string): void {
  const key = keyFor(uid);
  const set = store.get(key) ?? new Set<string>();
  set.add(matchId);
  store.set(key, set);
}
