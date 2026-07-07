// ==========================================================================
// Endpoint de diagnóstico TEMPORAL. Reporta cómo responde API-Football en
// producción (plan, temporada, si las variables quedaron bien). NO expone la
// llave (solo su longitud). Se elimina cuando terminemos de conectar datos.
// ==========================================================================
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = "https://v3.football.api-sports.io";

async function af(path: string, params: Record<string, string | number>) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY ?? "" },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}) as any);
  return {
    httpStatus: res.status,
    errors: (json as any)?.errors,
    results: (json as any)?.results,
    response: (json as any)?.response,
  };
}

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;
  const cfg = (process.env.API_FOOTBALL_LEAGUES ?? "262:2024").split(",")[0];
  const [league, season] = cfg.split(":");
  const today = new Date().toISOString().slice(0, 10);

  const out: Record<string, unknown> = {
    env: {
      USE_MOCK: process.env.USE_MOCK ?? null,
      hasKey: Boolean(key),
      keyLength: key ? key.length : 0,
      API_FOOTBALL_LEAGUES: process.env.API_FOOTBALL_LEAGUES ?? null,
      leagueUsed: league,
      seasonUsed: season,
      today,
    },
  };

  if (!key) {
    out.note = "No hay API_FOOTBALL_KEY en el entorno de Vercel.";
    return NextResponse.json(out, { status: 200 });
  }

  try {
    const s = await af("/status", {});
    out.status = {
      httpStatus: s.httpStatus,
      subscription: (s.response as any)?.subscription,
      requests: (s.response as any)?.requests,
      errors: s.errors,
    };
  } catch (e) {
    out.statusError = String(e);
  }

  try {
    const byDate = await af("/fixtures", { league, season, date: today });
    out.fixturesByDate = {
      httpStatus: byDate.httpStatus,
      results: byDate.results,
      errors: byDate.errors,
      sample: (byDate.response as any[] | undefined)
        ?.slice(0, 3)
        .map((f) => `${f.teams?.home?.name} vs ${f.teams?.away?.name} @ ${f.fixture?.date}`),
    };
  } catch (e) {
    out.fixturesByDateError = String(e);
  }

  try {
    const next = await af("/fixtures", { league, season, next: 5 });
    out.fixturesNext = {
      httpStatus: next.httpStatus,
      results: next.results,
      errors: next.errors,
      sample: (next.response as any[] | undefined)
        ?.slice(0, 5)
        .map((f) => `${f.teams?.home?.name} vs ${f.teams?.away?.name} @ ${f.fixture?.date}`),
    };
  } catch (e) {
    out.fixturesNextError = String(e);
  }

  return NextResponse.json(out, { status: 200 });
}
