# Arquitectura técnica

> Secciones 3 y 19 de la propuesta.

## Diagrama lógico

```
                    ┌─────────────────────────────────────────┐
                    │            Cliente (Next.js)             │
                    │  Web responsiva / PWA · React · Tailwind │
                    └───────────────┬─────────────────────────┘
                                    │  (Server Components / API routes)
             ┌──────────────────────┼──────────────────────────┐
             │                      │                          │
   ┌─────────▼─────────┐  ┌─────────▼─────────┐      ┌─────────▼─────────┐
   │  Capa de datos    │  │  Motor predictivo │      │   Capa de IA      │
   │ (src/lib/data)    │  │ (src/lib/engine)  │      │  (src/lib/ai)     │
   │  API-Football     │  │  reglas v1 →      │      │  Claude (LLM)     │
   │  The Odds API     │  │  ML (futuro)      │      │  explica, no      │
   │  Noticias         │  │  determinista     │      │  inventa números  │
   └─────────┬─────────┘  └─────────┬─────────┘      └─────────┬─────────┘
             │                      │                          │
             └──────────────────────┼──────────────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │      Supabase (Postgres)         │
                    │  datos, predicciones, usuarios,  │
                    │  auth, suscripciones, aciertos   │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │  Stripe (pagos) · Vercel (host)  │
                    └──────────────────────────────────┘
```

## Stack recomendado

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | **Next.js 14 (App Router) + TypeScript + Tailwind** | SSR, rápido, un solo lenguaje front/back, ideal para SEO de partidos |
| Backend | **Next.js API routes / Server Actions** (Node) | Sin servidor extra al inicio. Migrar a **Python FastAPI** solo cuando el ML lo pida |
| Base de datos | **Supabase (Postgres + Auth)** | Postgres real, auth incluida, RLS, generoso free tier |
| IA (texto) | **Claude (Anthropic)**, `claude-sonnet-5` | Excelente en español y en seguir reglas anti-alucinación |
| Motor de predicción | **Reglas v1 (TS)** → ML (Python) | Explicable desde el día 1; ML cuando haya datos |
| Pagos | **Stripe** | Estándar, soporta MXN y suscripciones |
| Hosting | **Vercel** | Deploy directo de Next.js, escalado automático |
| Admin | Next.js protegido por rol + Supabase | Panel simple sobre las mismas tablas |

**Principio de diseño:** el motor es **determinista y separado** de la IA. La IA
**nunca** calcula probabilidades; solo redacta la explicación a partir de los
números del motor. Esto evita alucinaciones y hace el sistema auditable.

## 19. Flujo completo (usuario selecciona un partido)

1. **Usuario** entra y selecciona un partido (`/partido/[id]`).
2. **Backend** consulta la API deportiva (partido, equipos, stats, lesiones,
   alineaciones) — vía `src/lib/data`.
3. **Backend** consulta **momios** (The Odds API).
4. **Backend** consulta **noticias** recientes (sentiment).
5. **Motor estadístico** (`src/lib/engine/predict.ts`) calcula probabilidades,
   confianza, riesgo, goles esperados, mercados y valor.
6. **IA** (`src/lib/ai/prompt.ts` + Claude) genera la explicación en lenguaje
   natural a partir de esos números (con filtro de frases prohibidas).
7. **Sistema** guarda la predicción en `predictions` (para el track record).
8. **Usuario** ve el análisis completo.
9. Tras el partido, un job compara la predicción contra el resultado real
   (`prediction_results`).
10. Se actualiza el **% de acierto** agregado (`accuracy_stats`).

En este repo los pasos 2–4 usan datos mock (`USE_MOCK=true`); el paso 5 ya es
real y funcional; el 6 está listo (prompt) para conectar la key de Anthropic; el
7–10 tienen su esquema en `supabase/schema.sql`.
