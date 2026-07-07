// ==========================================================================
// Endpoint de diagnóstico TEMPORAL. Sondea varias temporadas/fechas para
// descubrir qué devuelve el plan gratis de API-Football. NO expone la llave.
// Se elimina cuando terminemos de conectar datos.
// ==========================================================================
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = "https://v3.football.api-sports.io";
const LEAGUE = 262; // Liga MX

async function af(path: string, params: Record<string, string | number>) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}) as any);
  return { httpStatus: res.status, errors: (json as any)?.errors, results: (json as any)?.results, response: (json as any)?.response };
}

function sample(response: any[] | undefined) {
  return (response ?? [])
    .slice(0, 4)
    .map((f) => `${f.teams?.home?.name} vs ${f.teams?.away?.name} @ ${f.fixture?.date?.slice(0, 10)}`);
}

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;
  const out: Record<string, unknown> = {
    env: {
      USE_MOCK: process.env.USE_MOCK ?? null,
      hasKey: Boolean(key),
      today: new Date().toISOString().slice(0, 10),
    },
  };
  if (!key) {
    out.note = "No hay API_FOOTBALL_KEY en Vercel.";
    return NextResponse.json(out);
  }

  // Sondas: (temporada, rango de fechas donde suele haber jornada de Liga MX)
  const probes = [
    { label: "2023 ago", season: 2023, from: "2023-08-04", to: "2023-08-08" },
    { label: "2024 ago", season: 2024, from: "2024-08-02", to: "2024-08-06" },
    { label: "2024 nov", season: 2024, from: "2024-11-01", to: "2024-11-05" },
    { label: "2025 ago", season: 2025, from: "2025-08-01", to: "2025-08-12" },
    { label: "2026 jul", season: 2026, from: "2026-07-01", to: "2026-07-14" },
  ];

  const results: Record<string, unknown> = {};
  for (const p of probes) {
    try {
      const r = await af("/fixtures", { league: LEAGUE, season: p.season, from: p.from, to: p.to });
      results[p.label] = { results: r.results, errors: r.errors, sample: sample(r.response) };
    } catch (e) {
      results[p.label] = { error: String(e) };
    }
  }
  out.probes = results;
  return NextResponse.json(out);
}
