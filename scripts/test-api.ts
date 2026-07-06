// ==========================================================================
// Prueba tu llave de API-Football sin tocar el resto de la app.
// Uso:  API_FOOTBALL_KEY=tu_llave pnpm api:test
// (o pon la llave en .env.local y corre: pnpm api:test)
// ==========================================================================
import { readFileSync } from "node:fs";

// Carga simple de .env.local si existe (para no depender de librerías).
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* sin .env.local, se usan variables del sistema */
}

const KEY = process.env.API_FOOTBALL_KEY;
const BASE = "https://v3.football.api-sports.io";

async function get(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": KEY ?? "" },
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

async function main() {
  console.log("\n🔑 Probando tu llave de API-Football...\n");

  if (!KEY) {
    console.error("❌ No encontré la llave. Pon API_FOOTBALL_KEY en .env.local");
    console.error("   o corre:  API_FOOTBALL_KEY=tu_llave pnpm api:test\n");
    process.exit(1);
  }

  // 1) Estado de la cuenta
  const s = await get("/status");
  if (s.status === 401 || s.status === 403) {
    console.error("❌ La llave no es válida (o no está activada). Revisa que la copiaste completa.\n");
    process.exit(1);
  }
  const r = s.json?.response ?? {};
  console.log("✅ ¡Llave válida! Conexión con API-Football establecida.");
  console.log("   Cuenta:", r.account?.firstname ?? "-", r.account?.lastname ?? "");
  console.log("   Plan:", r.subscription?.plan ?? "-");
  console.log(
    `   Consultas hoy: ${r.requests?.current ?? "?"} / ${r.requests?.limit_day ?? "?"}\n`
  );

  // 2) Próximos partidos de la liga configurada
  const cfg = (process.env.API_FOOTBALL_LEAGUES ?? "262:" + new Date().getFullYear()).split(",")[0];
  const [league, season] = cfg.split(":");
  console.log(`📅 Buscando próximos partidos (liga ${league}, temporada ${season})...\n`);
  const fx = await get("/fixtures", { league, season, next: 5 });
  const games = fx.json?.response ?? [];

  if (games.length === 0) {
    console.log("⚠️  No hubo partidos para esa liga/temporada.");
    console.log("   El plan gratis limita algunas temporadas. Prueba otra temporada");
    console.log("   ajustando API_FOOTBALL_LEAGUES en .env.local, p.ej. 262:2023.\n");
    return;
  }

  for (const g of games.slice(0, 5)) {
    const date = new Date(g.fixture.date).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    console.log(`   • ${g.teams.home.name} vs ${g.teams.away.name}  —  ${date}`);
  }
  console.log("\n🎉 Todo funciona. Pon USE_MOCK=false en .env.local para usar datos reales en la app.\n");
}

main().catch((e) => {
  console.error("Error inesperado:", e);
  process.exit(1);
});
