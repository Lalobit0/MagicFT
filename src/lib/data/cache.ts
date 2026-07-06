// ==========================================================================
// Caché con expiración (TTL). ESTA ES LA PIEZA QUE MANTIENE BARATA LA APP:
// evita llamar a la API deportiva una vez por usuario. Se llama a la API una
// vez por dato, se guarda aquí, y todos los usuarios leen desde la caché.
//
// DEMO: caché en memoria. En producción, la caché "real" es la tabla de
// Supabase (los datos ya viven en tu base); esto sería solo una capa extra
// de memoria para reducir aún más lecturas. La interfaz no cambia.
// ==========================================================================

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const globalCache = globalThis as unknown as {
  __mftCache?: Map<string, Entry<unknown>>;
};
const cache: Map<string, Entry<unknown>> = (globalCache.__mftCache ??= new Map());

/**
 * Devuelve el valor cacheado si sigue vigente; si no, ejecuta `loader`,
 * guarda el resultado con el TTL indicado y lo devuelve.
 *
 * @param key   clave única (ej. `fixtures:39:2025-08-10`)
 * @param ttlMs milisegundos de vigencia (ej. 15 min = 900_000)
 */
export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }
  const value = await loader();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/** TTLs sugeridos por tipo de dato (equilibrio frescura vs. consultas). */
export const TTL = {
  fixtures: 15 * 60_000, // lista de partidos: 15 min
  teamStats: 12 * 60 * 60_000, // stats de equipo: 12 h (cambian poco intra-día)
  standings: 6 * 60 * 60_000, // tabla: 6 h
  injuries: 60 * 60_000, // lesiones: 1 h
  odds: 10 * 60_000, // momios: 10 min (se mueven)
} as const;

/** Limpia toda la caché (útil en tests o para forzar refresco). */
export function clearCache(): void {
  cache.clear();
}
