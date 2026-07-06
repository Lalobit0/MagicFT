# Modelo de negocio, costos y equipo

> Secciones 12, 15 y 16.

## 12. Monetización

Modelo **freemium + suscripción** (precios en MXN, pensados para LATAM):

| Plan | Precio | Incluye |
|---|---|---|
| **Gratis** | $0 | 3 análisis/día, partidos de hoy, probabilidad + confianza, 1 deporte |
| **Premium** | **$149 MXN/mes** | Análisis ilimitados, momios + valor, ranking del día, historial y % de acierto, alertas básicas |
| **Pro / VIP** | **$349 MXN/mes** | Todo Premium + alertas en tiempo real, mercados avanzados/props, acceso anticipado a deportes, soporte prioritario |
| **Créditos** | $49 por 20 análisis | Para quien no quiere suscripción (pago único) |

**Otras vías:**
- **Afiliados:** enlaces a casas de apuestas reguladas (comisión CPA/revenue share).
  ⚠️ Con cuidado legal y sin comprometer la independencia del análisis.
- **B2B para creadores:** API/white-label para tipsters y medios deportivos
  ($1,500–$8,000 MXN/mes según volumen).
- **Anual con descuento:** Premium anual ~$1,290 (equiv. 2 meses gratis).

Referencias de precios anuales: Premium ~$1,290/año · Pro ~$2,990/año.

## 15. Costos estimados (MXN, mensual salvo indicado)

| Concepto | Bajo | Medio | Alto |
|---|---|---|---|
| Desarrollo MVP (una vez) | $0 (tú + IA) | $40k–$120k | $250k+ (agencia) |
| APIs deportivas | $0 (free tiers) | $600–$1,800 | $8k+ |
| Hosting (Vercel) | $0 (hobby) | $400 (Pro) | $2k+ |
| IA (LLM) | $200–$600 | $1k–$3k | $6k+ (según uso) |
| Base de datos (Supabase) | $0 | $500 (Pro) | $2k+ |
| Diseño | $0 (plantillas) | $8k–$25k (una vez) | $60k+ |
| Mantenimiento | $0–$1k | $3k–$8k | $20k+ |
| **Versión avanzada (ML)** | — | +$30k–$80k (una vez) | +$200k+ |

**MVP realista (camino híbrido):** **$0–$8,000 MXN/mes** los primeros meses,
apoyándote en free tiers y IA. El mayor costo variable serán los momios al escalar.

## 16. Equipo — tres caminos

### A) No-code
- Herramientas: Bubble/FlutterFlow + Airtable + Zapier/Make + APIs.
- **Pro:** rápido, barato al inicio, sin programar.
- **Contra:** el motor predictivo y la lógica de valor **se quedan cortos** en
  no-code; difícil de escalar; costos de plataforma suben con el uso.
- **Veredicto:** sirve para una landing o un piloto muy simple, **no** para el
  motor de MagicFT.

### B) Desarrollo tradicional
- Equipo: 1 full-stack, 1 data scientist, 1 diseñador, (1 PM).
- **Pro:** control total, calidad, escalable.
- **Contra:** más caro y lento; sobredimensionado para validar la idea.

### C) Híbrido con IA + APIs (RECOMENDADO)
- 1 persona técnica (o tú + Claude Code) construye sobre este repo: Next.js +
  Supabase + APIs + LLM. Diseño con plantillas Tailwind. ML se subcontrata solo
  cuando haya datos.
- **Pro:** costo mínimo, velocidad alta, base de código real y escalable.
- **Contra:** requiere algo de perfil técnico (o buen uso de IA).
- **Veredicto:** el mejor equilibrio para llegar al MVP. **Este repo es el punto
  de partida de este camino.**
