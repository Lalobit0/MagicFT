# Conectar datos reales (API-Football) — guía paso a paso

> Tiempo: ~3-5 minutos. Costo: **gratis** (100 consultas/día).
> Al terminar, la app deja de usar datos de ejemplo y muestra partidos reales.

## Paso 1 — Crear tu cuenta gratis
1. Entra a **https://dashboard.api-football.com/register**
2. Regístrate con tu correo y confirma el email (revisa spam si no llega).
3. Inicia sesión en el dashboard.

> ⚠️ Usa **dashboard.api-football.com** (API-Sports directo), NO la versión de
> RapidAPI. El código de MagicFT está hecho para la versión directa.

## Paso 2 — Copiar tu llave (API key)
1. En el dashboard, ve a la sección **"My Access"** o **"API Keys"**.
2. Verás una llave larga (ej. `a1b2c3d4e5f6...`). Cópiala completa.
3. Tu plan gratis (100 consultas/día) ya está activo automáticamente.

## Paso 3 — Poner la llave en la app
Crea un archivo llamado **`.env.local`** en la raíz del proyecto (junto a
`package.json`) con esto:

```bash
USE_MOCK=false
API_FOOTBALL_KEY=pega_aqui_tu_llave
API_FOOTBALL_LEAGUES=262:2024
```

- `262` es **Liga MX**. Puedes agregar más ligas: `262:2024,39:2024` (39 = Premier League).
- Si el plan gratis no trae la temporada actual, cambia el año: `262:2023`.

## Paso 4 — Probar que funciona
En la terminal, dentro del proyecto:

```bash
pnpm api:test
```

- ✅ Si la llave sirve, verás tu plan, cuántas consultas te quedan y una lista de
  próximos partidos reales.
- ❌ Si dice "llave no válida", revisa que la copiaste completa.
- ⚠️ Si no trae partidos, ajusta la temporada en `API_FOOTBALL_LEAGUES` (Paso 3).

## Paso 5 — Ver datos reales en la app
```bash
pnpm dev
```
Abre http://localhost:3000 — ahora los partidos son **reales**. El motor los
analiza igual que antes; solo cambió la fuente de datos.

---

## Notas importantes
- **La llave es secreta.** No la subas a GitHub. `.env.local` ya está en `.gitignore`.
  Puedes regenerarla desde el dashboard si se te expone.
- **La caché te protege:** aunque muchos usuarios abran la app, las consultas a la
  API se comparten (ver `src/lib/data/cache.ts`). No gastas una consulta por usuario.
- **Momios:** para las cuotas reales necesitas además The Odds API
  (https://the-odds-api.com, plan gratis 500/mes) → variable `ODDS_API_KEY`.
  Sin ella, la app funciona igual pero sin la comparación de valor.
- **¿Dónde correrá la app de verdad?** En tu compu (`pnpm dev`) o publicada en
  Vercel. Si la publicas en Vercel, la llave se pone en *Settings → Environment
  Variables* del proyecto, no en tu compu.
