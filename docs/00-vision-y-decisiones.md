# MagicFT — Visión y decisiones clave

> Documento estratégico. Resume las decisiones que guían el código.
> Secciones 1, 2 y 20 de la propuesta original.

## 1. Validación de la idea

**¿Es viable?** Sí, técnica y comercialmente. Todo lo que se necesita ya existe:
datos deportivos por API, un motor estadístico explicable y un LLM para redactar
el análisis. Nada aquí depende de "magia".

**Qué SÍ se puede hacer:**
- Estimar **probabilidades** a partir de datos objetivos (forma, ataque, defensa,
  localía, bajas, momios).
- Explicar el análisis en lenguaje claro.
- Comparar la probabilidad estimada contra los momios y **detectar valor**.
- Clasificar **confianza** y **riesgo**.
- Medir el **% de acierto** histórico de la app con honestidad.

**Qué NO se puede garantizar (y nunca hay que prometer):**
- Acertar un partido concreto. El deporte es incierto por naturaleza.
- "Apuestas seguras". No existen. La app **no** las vende.
- Ganancias. La app informa; el usuario decide y asume el riesgo.

**Riesgos del proyecto:**
- **Legal/regulatorio:** normativa de juego varía por país. Mitigación: posicionarse
  como *análisis/información*, disclaimers, +18, sin procesar apuestas.
- **Costo de datos:** las APIs de momios e in-play pueden encarecer al escalar.
  Mitigación: cachear, empezar con 1 liga/1 deporte.
- **Credibilidad:** si el % de acierto es malo y se oculta, mueres. Mitigación:
  transparencia total del track record.
- **Dependencia de terceros:** cambios de precios/ToS de las APIs. Mitigación:
  capa de abstracción de datos (ya implementada: interfaz `Fixture`).

**¿Hay mercado?** Sí. Millones de aficionados en LATAM siguen fútbol y consumen
contenido de pronósticos (tipsters en YouTube/Telegram). El problema: hoy es
opaco y muchas veces deshonesto. Hay hueco para una marca **seria, transparente
y basada en datos**.

**Cómo diferenciarla:**
1. **Transparencia radical:** % de acierto público y auditable.
2. **Explicabilidad:** cada predicción muestra *por qué* (factores + peso).
3. **Responsabilidad:** nunca "apuesta segura"; siempre riesgo y disclaimer.
4. **Mercados alternativos:** no solo "gana X", sino la opción más inteligente.
5. **Enfoque LATAM:** español claro, ligas locales, precios en MXN.

## 2. Alcance del MVP

**Deporte inicial: ⚽ Fútbol.** Razones:
- Mejor relación datos/costo (API-Football tiene *free tier* de 100 req/día).
- Máximo volumen de partidos y de audiencia en LATAM.
- El mercado 1X2 + líneas de goles es perfecto para un motor explicable.

Arrancar con **1–2 ligas** (Liga MX + una europea top) para acotar costos.

**Incluido en la v1 (lo que ya construimos o sigue de inmediato):**
1. Partidos de hoy y próximos.
2. Detalle de partido con análisis completo.
3. Motor de probabilidad (reglas v1) + confianza + riesgo.
4. Comparación con momios y detección de valor.
5. Mercados recomendados (conservador → agresivo).
6. Explicación en lenguaje natural.
7. Disclaimers responsables.

**Diferido a fases futuras:**
- Machine learning (primero acumular datos con reglas).
- Múltiples deportes.
- Alertas en tiempo real y comunidad.
- App móvil nativa (empezar como web responsiva / PWA).
- Props avanzados y datos de jugador granular.

## 20. Recomendación final

1. **¿Conviene hacerla?** Sí, con enfoque de análisis (no de "tips seguros").
2. **¿Con qué versión empezar?** La del MVP: fútbol, 1–2 ligas, motor por reglas,
   web responsiva. Ya está el esqueleto funcionando en este repo.
3. **¿Qué deporte primero?** Fútbol.
4. **¿Cuánto cuesta?** Ver `docs/04-negocio-y-costos.md`. MVP realista:
   **$0–$8,000 MXN/mes** si lo llevas híbrido (tú + IA + APIs free/low tier).
5. **¿Qué tan difícil es?** Media. El "cerebro" (lo difícil de diseñar bien) ya
   está resuelto en este repo. Lo demás es integración y producto.
6. **¿Qué evitar?** Prometer resultados, ocultar el track record, quemar dinero en
   APIs premium antes de validar, y meter 6 deportes el día 1.
7. **Siguiente paso práctico:** conseguir API keys (API-Football + The Odds API),
   crear el proyecto Supabase, reemplazar la capa mock por datos reales de 1 liga,
   y publicar en Vercel. Ver el checklist abajo.

---

## Marca

- **Nombre recomendado:** **MagicFT** (Magic *Football Tips* / *Fair Tips*). Corto,
  memorable, funciona como dominio y usuario social. Alternativas: *DataPick*,
  *ProbaGol*, *EdgeSport*.
- **Slogan:** **"Analiza. Decide con datos."** (alt: *"Menos corazonadas, más datos."*)

## Resumen ejecutivo (para socios/inversionistas)

> MagicFT es una plataforma SaaS de análisis deportivo con IA para el mercado
> hispanohablante. Convierte datos objetivos (forma, estadísticas, bajas, momios,
> noticias) en probabilidades explicadas, con nivel de confianza, riesgo y
> mercados recomendados. A diferencia de los "tipsters" tradicionales, MagicFT es
> **transparente** (track record público), **responsable** (nunca promete
> resultados) y **explicable**. Modelo freemium con suscripción mensual en MXN.
> MVP enfocado en fútbol/Liga MX, con arquitectura lista para escalar a NBA, NFL,
> MLB, tenis y UFC. El motor predictivo determinista ya está construido y
> validado; el camino a ML está trazado conforme se acumulen datos.

## Plan de lanzamiento (30 días)

- **Semana 1 — Fundaciones:** keys de APIs, proyecto Supabase, deploy del esqueleto
  actual en Vercel, dominio. Definir 1–2 ligas.
- **Semana 2 — Datos reales:** reemplazar mock por API-Football (partidos, equipos,
  stats, lesiones) y The Odds API (momios). Guardar predicciones en BD.
- **Semana 3 — Producto:** auth con Supabase, límite del plan gratis, pantalla de
  historial y % de acierto, pulir UX móvil.
- **Semana 4 — Monetización y lanzamiento suave:** Stripe (Premium), landing,
  captar 20–50 usuarios beta (Telegram/redes), recoger feedback, medir aciertos.

## Checklist inicial (lo primero que debes hacer)

- [ ] Crear cuentas: API-Football (api-sports.io), The Odds API, Supabase, Vercel,
      Stripe, Anthropic.
- [ ] Poner las keys en `.env.local` (ver `.env.example`).
- [ ] Elegir las 1–2 ligas del MVP.
- [ ] Ejecutar `supabase/schema.sql` en tu proyecto Supabase.
- [ ] Implementar el conector real de API-Football detrás de `src/lib/data/matches.ts`.
- [ ] Conectar momios reales y activar la detección de valor con datos vivos.
- [ ] Deploy en Vercel y validar en móvil.
- [ ] Empezar a registrar predicciones para medir el % de acierto desde el día 1.
