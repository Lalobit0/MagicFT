# APIs deportivas

> Sección 4. Comparativa práctica y recomendación para el MVP.
> Precios aproximados (verifica siempre en la web oficial, cambian seguido).

## Recomendación resumida

| Necesidad | MVP (barato) | Al escalar |
|---|---|---|
| Partidos, equipos, jugadores, stats, lesiones, alineaciones | **API-Football** (api-sports.io) | API-Football planes altos / **Sportradar** |
| Momios / cuotas | **The Odds API** | OddsJam / Sportradar Odds |
| Noticias | GNews / NewsAPI / RSS + LLM para sentiment | Proveedor dedicado |
| Resultados en vivo | API-Football (in-play) | Sportradar / Genius Sports |

## Fichas por proveedor

### API-Football (api-sports.io)
- **Ofrece:** fixtures, ligas, equipos, jugadores, estadísticas, **lesiones**,
  **alineaciones**, H2H, standings, algunos momios. Cobertura enorme de fútbol
  (+1,100 ligas) y también NBA/NFL/MLB por APIs hermanas (API-Sports).
- **Ventajas:** barato, free tier (100 req/día), documentación clara, todo-en-uno
  para fútbol. Ideal para el MVP.
- **Desventajas:** momios limitados, latencia in-play no es de nivel casa de
  apuestas, rate limits en tiers bajos.
- **Costo:** Free 100 req/día · ~US$25–40/mes tiers medios · más arriba por volumen.
- **MVP:** ✅ Sí (la mejor opción). **Escalar:** ⚠️ Ok con tiers altos.
- **Integración:** Fácil (REST + JSON, headers de key).

### The Odds API
- **Ofrece:** momios pre-partido y algunos in-play de decenas de casas, múltiples
  deportes y mercados (1X2, totals, spreads).
- **Ventajas:** especializado en momios, fácil, buen free tier.
- **Desventajas:** créditos por request (mercados x casas consumen rápido),
  no da stats de equipos.
- **Costo:** Free 500 req/mes · US$30–99+/mes según volumen.
- **MVP:** ✅ Sí (para momios). **Escalar:** ⚠️ Ok; vigilar consumo.
- **Integración:** Fácil.

### SportsDataIO
- **Ofrece:** datos y momios de NBA, NFL, MLB, fútbol, etc., de buena calidad.
- **Ventajas:** datos ricos de ligas de EE.UU., props de jugadores.
- **Desventajas:** más caro, orientado a EE.UU., contrato/planes.
- **Costo:** desde cientos de US$/mes (hay trials).
- **MVP:** ⚠️ Solo si tu foco fueran ligas USA. **Escalar:** ✅ Sí.
- **Integración:** Media.

### Sportradar
- **Ofrece:** el estándar de la industria: datos oficiales, in-play de baja
  latencia, odds, todo deporte.
- **Ventajas:** máxima calidad y cobertura, licencias oficiales.
- **Desventajas:** caro y con contratos empresariales; overkill para un MVP.
- **Costo:** enterprise (miles de US$).
- **MVP:** ❌ No. **Escalar:** ✅ Sí, cuando haya ingresos.
- **Integración:** Media-alta (más burocracia que técnica).

## Regla de oro de costos
El gasto se dispara con **momios × mercados × casas × frecuencia** y con **in-play**.
Para el MVP: pre-partido, 1–2 ligas, refresco cada 15–30 min, y **cachea todo** en
Supabase. La capa `src/lib/data` ya aísla al resto de la app del proveedor, así que
cambiar o combinar APIs no toca la UI ni el motor.
