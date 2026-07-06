# Diseño UX/UI

> Sección 10. Estado: ✅ implementada · 🔜 pendiente en el MVP.

Principios: móvil primero, oscuro por defecto ("cancha"), jerarquía clara
(veredicto arriba, detalle abajo), color = semántica (verde=favorable/bajo riesgo,
ámbar=cautela, rojo=riesgo alto/no recomendable). Disclaimer siempre visible.

| Pantalla | Qué muestra | Estado |
|---|---|---|
| **Inicio** | Hero, ranking de "picks más confiables", accesos a hoy/próximos | ✅ |
| **Partidos de hoy** | Grid de tarjetas (equipos, hora, favorito+%, badges confianza/riesgo) | ✅ |
| **Próximos partidos** | Igual que hoy pero >24h | ✅ |
| **Ranking de mejores picks** | Top del día por score de confianza (excluye "no recomendable") | ✅ |
| **Detalle del partido** | Encabezado + goles esperados + completitud de datos | ✅ |
| **Análisis equipo A / B** | Subscores por factor (forma, ataque, defensa, tabla, H2H) | ✅ (barra de factores) |
| **Comparativo** | Barra de factores lado a lado (ventaja local vs visita) | ✅ |
| **Predicción final** | Barra 1X2, pick, explicación en lenguaje natural | ✅ |
| **Prob. vs momios / valor** | Tabla modelo vs mercado, edge, EV, señal de valor | ✅ |
| **Mercados recomendados** | Lista ordenada conservador→agresivo con % y razón | ✅ |
| **Historial de predicciones** | Predicciones pasadas + resultado + % de acierto | 🔜 (esquema listo) |
| **Perfil del usuario** | Datos, plan, uso, preferencias de deportes/ligas | 🔜 |
| **Planes de pago** | Comparativa Gratis/Premium/Pro, CTA a Stripe | ✅ (UI; falta Stripe) |
| **Panel administrador** | Salud de datos, predicciones, aciertos, usuarios, suscripciones | 🔜 |

Componentes clave ya implementados: `MatchCard`, `MatchAnalysis`, `ProbabilityBar`,
`ConfidenceBadge`, `RiskBadge` (en `src/components/`).
