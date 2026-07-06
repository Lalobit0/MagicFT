# ⚽ MagicFT — Análisis deportivo con IA

> **Analiza. Decide con datos.**
> Plataforma de análisis y probabilidad deportiva. Convierte datos (forma, stats,
> bajas, momios, noticias) en predicciones **explicadas**, con nivel de confianza,
> riesgo y mercados recomendados.
>
> **No es una casa de apuestas. No promete resultados ni vende "apuestas seguras".**

---

## ¿Qué hay construido? (MVP — Fase 1)

Una app **Next.js que ya corre** con un **motor predictivo determinista y
explicable** para fútbol, end-to-end, **sin necesidad de API keys** (usa datos
mock mientras `USE_MOCK=true`):

- ✅ **Motor de predicción v1** (reglas + ponderaciones) — `src/lib/engine/`
  - Índice de poder, modelo logístico 1X2, empate, goles esperados (Poisson)
  - Mezcla con momios, **detección de valor** (edge + EV)
  - **Confianza** (5 niveles) y **riesgo** (4 niveles)
  - **Mercados recomendados** (conservador → agresivo)
- ✅ **Explicación en lenguaje natural** (fallback determinista + prompt de IA listo
  para Claude) — `src/lib/ai/`
- ✅ **UI**: inicio con ranking de picks, partidos de hoy/próximos, detalle de
  partido con análisis completo, planes — `src/app/`, `src/components/`
- ✅ **Esquema de base de datos** (Postgres/Supabase) — `supabase/schema.sql`
- ✅ **Filtro de lenguaje irresponsable** (frases prohibidas) y disclaimers

## Probarlo en 30 segundos

```bash
pnpm install
pnpm engine:demo      # imprime las 4 predicciones de ejemplo en consola
pnpm dev              # http://localhost:3000
```

No necesitas ninguna API key para esto (modo mock).

## Estructura

```
src/
  app/                 # Páginas Next.js (inicio, partido/[id], planes)
  components/          # UI (MatchCard, MatchAnalysis, badges, barra 1X2)
  lib/
    types.ts           # Tipos de dominio (fuente de verdad)
    engine/            # ⭐ Motor predictivo (config, math, predict, confidence, risk, markets, value)
    ai/                # Prompt interno de la IA + filtro de frases prohibidas
    data/              # Capa de datos (mock hoy; API-Football mañana)
supabase/schema.sql    # Esquema de BD
scripts/engine-demo.ts # Demo del motor por consola
docs/                  # Estrategia completa (ver abajo)
```

## Documentación (la propuesta de 20 secciones, aterrizada)

| Doc | Contenido |
|---|---|
| [`docs/00-vision-y-decisiones.md`](docs/00-vision-y-decisiones.md) | Validación, MVP, recomendación final, marca, pitch, plan 30 días, checklist |
| [`docs/01-arquitectura.md`](docs/01-arquitectura.md) | Arquitectura y flujo completo |
| [`docs/02-apis-deportivas.md`](docs/02-apis-deportivas.md) | Comparativa de APIs (API-Football, The Odds API, etc.) |
| [`docs/03-motor-predictivo.md`](docs/03-motor-predictivo.md) | Motor, confianza, riesgo, mercados |
| [`docs/04-negocio-y-costos.md`](docs/04-negocio-y-costos.md) | Monetización, costos, equipo |
| [`docs/05-roadmap.md`](docs/05-roadmap.md) | Roadmap por fases |
| [`docs/06-formula-futbol.md`](docs/06-formula-futbol.md) | Fórmula + ejemplo de cálculo |
| [`docs/07-ux-ui.md`](docs/07-ux-ui.md) | Pantallas y UX |
| [`docs/08-ejemplos-respuesta.md`](docs/08-ejemplos-respuesta.md) | 4 ejemplos de salida |
| [`docs/legal.md`](docs/legal.md) | Legal, disclaimers, lenguaje prohibido |

## Stack

Next.js 14 · TypeScript · Tailwind · Supabase (Postgres+Auth) · Claude (IA) ·
Stripe (pagos) · Vercel (hosting).

## Siguientes pasos

1. Crear keys (ver `.env.example`) y proyecto Supabase; ejecutar `schema.sql`.
2. Implementar el conector real de **API-Football** detrás de `src/lib/data/matches.ts`
   (misma interfaz `Fixture` → cero cambios en UI/motor).
3. Conectar **momios** reales (The Odds API) y **Claude** para las explicaciones.
4. Auth + límite del plan gratis + historial y % de acierto.
5. Deploy en Vercel.

> ⚠️ MagicFT ofrece análisis informativo. No garantiza resultados. Apostar implica
> riesgo de pérdida económica. Juega con responsabilidad. Solo mayores de 18 años.
