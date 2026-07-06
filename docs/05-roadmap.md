# Roadmap por fases

> Sección 14. Dificultad: 🟢 baja · 🟡 media · 🔴 alta.

| Fase | Qué incluye | Dificultad | Prioridad | Costo aprox. (una vez / mensual) |
|---|---|---|---|---|
| **1 — MVP básico** | Partidos hoy/próximos, detalle, motor v1 (reglas), confianza, riesgo, mercados, explicación IA. **(Base ya construida en este repo.)** | 🟡 | Máxima | $0–$40k / $0–$3k |
| **2 — Integración de momios** | The Odds API en vivo, comparación prob vs momio, detección de valor con datos reales, movimiento de línea | 🟡 | Alta | $10k–$30k / +$1k |
| **3 — Histórico de predicciones** | Guardar cada predicción, settle automático post-partido, % de acierto público, ranking de picks | 🟡 | Alta | $10k–$25k / +$500 |
| **4 — Más deportes** | NBA → NFL → MLB → tenis → UFC. Motor por deporte reutilizando la arquitectura | 🔴 | Media | $30k–$80k / +$2k–$8k (APIs) |
| **5 — ML avanzado** | Dixon-Coles para goles, gradient boosting para 1X2, calibración, microservicio Python | 🔴 | Media | $30k–$80k / +$1k |
| **6 — App móvil** | PWA primero; luego React Native/Expo. Push notifications | 🟡 | Media | $40k–$120k / +$500 |
| **7 — Alertas y comunidad** | Alertas en tiempo real (lesión, alineación, movimiento de momios), foros/comentarios, seguimiento de tipsters | 🔴 | Baja-Media | $30k–$100k / +$2k |

**Orden recomendado:** 1 → 2 → 3 (transparencia = tu diferenciador) → 6 (PWA para
alcance móvil barato) → 4 → 5 → 7.
