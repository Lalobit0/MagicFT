# Riesgos legales y disclaimers

> Sección 13. **Esto no es asesoría legal.** Consulta a un abogado especializado
> en juego/apuestas para tu país antes de lanzar comercialmente.

## Postura del producto
MagicFT es una **plataforma de análisis e información**, NO una casa de apuestas y
NO procesa apuestas. Esta distinción es la base de su defensa legal y de su ética.

## Cuidados clave
1. **+18 y verificación de edad** en el registro.
2. **Disclaimer visible** en cada análisis y en el pie de toda la app.
3. **No garantizar resultados** en ningún texto, anuncio o marketing.
4. **Track record honesto:** el % de acierto mostrado debe ser real y auditable.
5. **Juego responsable:** enlaces a líneas de ayuda por ludopatía; opción de
   autoexclusión/limitar notificaciones.
6. **Afiliados con cuidado:** si enlazas a casas, que estén reguladas en la
   jurisdicción del usuario y sin mezclar el enlace con lenguaje de "garantía".
7. **Geobloqueo** donde la ley lo exija.
8. **Privacidad:** cumplir la ley de datos aplicable (en México, LFPDPPP; si tienes
   usuarios en la UE, GDPR). Aviso de privacidad y términos de uso.
9. **Menores y publicidad:** nunca dirigir marketing a menores.

## Disclaimer sugerido (textual)
> "Las predicciones y análisis mostrados en MagicFT tienen únicamente fines
> informativos y de análisis estadístico. **No garantizan resultados.** Apostar
> implica riesgo y puede generar pérdidas económicas. Juega con responsabilidad.
> Contenido exclusivo para mayores de 18 años. Si el juego deja de ser un
> entretenimiento, busca ayuda."

Versión corta (pie/tarjetas):
> "Análisis informativo, no garantiza resultados. Apostar implica riesgo. +18."

## Lenguaje PROHIBIDO (bloqueado por código)
`src/lib/ai/prompt.ts → BANNED_PHRASES` filtra automáticamente:
- "apuesta segura" / "apuestas seguras"
- "garantizado" / "garantizada"
- "gana sí o sí"
- "dinero fácil"
- "sin riesgo"
- "100% seguro" / "no puede perder"

La función `findBannedPhrases()` debe correr sobre **toda** salida de la IA y sobre
textos de marketing antes de publicarlos. Si detecta algo, se bloquea/re-genera.
