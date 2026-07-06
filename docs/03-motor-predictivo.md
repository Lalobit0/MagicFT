# Motor predictivo

> Secciones 5, 7, 8 y 9. El motor está implementado en `src/lib/engine/`.

## 5. Diseño del motor

El motor es **determinista y explicable**. Recibe un `MatchInput` y devuelve una
`Prediction` (ver `src/lib/types.ts`). Tres versiones planificadas:

### v1 — Reglas y ponderaciones (IMPLEMENTADA)
`predict.ts`. Flujo:
1. **Índice de poder** por equipo (0–100) = suma ponderada de subscores:
   forma, ataque, defensa, tabla, H2H (pesos en `config.ts`, `BASE_WEIGHTS`).
2. **Ajustes aditivos**: localía (+8), descanso (±), lesiones (−), noticias (±).
3. **Diferencia de poder → logística** → probabilidad de local.
4. **Modelo de empate** (decae con la diferencia) y reparto local/visitante.
5. **Mezcla con el mercado** (λ=0.4) si hay momios: ancla el modelo a la sabiduría
   del mercado sin renunciar a encontrar valor.
6. **Confianza, riesgo, mercados y valor**.

### v2 — Machine Learning (futuro)
Cuando haya varios miles de predicciones registradas:
- Modelo de clasificación (gradient boosting: XGBoost/LightGBM) para 1X2.
- **Poisson / Dixon-Coles** para goles (mejor que la Poisson simple actual).
- Features = los mismos factores + históricos + embeddings de forma.
- Se sirve desde un microservicio Python (FastAPI); la interfaz `Prediction` no
  cambia, así que la UI sigue igual.

### v3 — Avanzada (futuro lejano)
- Datos granulares (xG por tiro, tracking), modelos por liga, calibración
  bayesiana, actualización en vivo con eventos del partido, ensembles.

## Ponderación de variables (v1)

Base (suman 1): forma 0.26 · ataque 0.20 · defensa 0.20 · tabla 0.18 · H2H 0.16.
Ajustes (en puntos de poder): localía +8 · descanso ±1.5/día (tope 3) ·
lesiones −5/impacto · noticias ±4×sentimiento. Todo editable en `config.ts`.

## 7. Niveles de confianza

Score de confianza = 0.5·fuerza_del_favorito + 0.25·acuerdo_con_mercado +
0.25·completitud_de_datos. Bandas:

| Nivel | Score | Cuándo se usa |
|---|---|---|
| **Confianza alta** | ≥ 75 | Favorito marcado, datos completos, modelo y mercado coinciden |
| **Media-alta** | 62–75 | Favorito claro pero con algún matiz |
| **Media** | 50–62 | Ventaja moderada; partido decidible |
| **Baja** | 40–50 | Ventaja pequeña o datos incompletos |
| **No recomendable** | < 40 | Muy parejo / faltan datos / señales contradictorias → la app sugiere NO pronosticar |

## 8. Sistema de riesgo

Score de riesgo suma factores que elevan la incertidumbre:
cercanía del partido, goles esperados (varianza), lesiones, datos faltantes,
desacuerdo modelo↔mercado, fatiga/calendario y clima adverso.

| Nivel | Score | Qué lo eleva |
|---|---|---|
| **Bajo** | < 30 | Favorito claro, plantel completo, pocos goles esperados |
| **Moderado** | 30–52 | Partido decidible con algún factor de ruido |
| **Alto** | 52–72 | Parejo + bajas o muchos goles esperados |
| **Extremo** | ≥ 72 | Muy parejo, bajas importantes, datos incompletos, clima |

## 9. Mercados recomendados

La app **no** recomienda solo "ganador". `markets.ts` propone alternativas y las
etiqueta por agresividad:

| Mercado | Etiqueta | Nota |
|---|---|---|
| Doble oportunidad (1X / X2) | **conservador** | Cubre victoria o empate |
| Empate no acción (DNB) | **conservador** | Devuelve si hay empate |
| Menos de 3.5 goles | conservador | Partidos de pocos goles |
| Más de 1.5 goles | conservador | Partidos ofensivos |
| Ambos anotan (BTTS) | moderado | Defensas frágiles + ataques activos |
| Ganador directo | moderado/agresivo | Solo si prob ≥ 55% y riesgo ≠ extremo |
| Más de 2.5 goles | agresivo | Mayor pago, más riesgo |
| Hándicap / props / over-under (NBA/NFL/MLB) | según caso | Fases futuras |

**Cómo evita recomendaciones irresponsables:** si la confianza es *No recomendable*
o el riesgo *Extremo*, no se destaca el ganador directo y se prioriza lo
conservador (o se sugiere no apostar). Toda salida lleva disclaimer.
