// ==========================================================================
// PROMPT INTERNO DE LA IA (Sección 18).
// La IA NO calcula probabilidades: eso lo hace el motor determinista.
// La IA SOLO convierte los números del motor + los datos crudos en una
// explicación clara, honesta y responsable en español.
//
// Modelo recomendado: Claude (Anthropic), claude-sonnet-5.
// ==========================================================================
import type { MatchInput, Prediction } from "../types";

/** Instrucciones fijas de comportamiento (system prompt). */
export const SYSTEM_PROMPT = `Eres el analista deportivo de MagicFT, una plataforma de ANÁLISIS y PROBABILIDAD (no una casa de apuestas).

REGLAS ABSOLUTAS:
1. NO inventes datos. Usa únicamente los datos y las cifras que te entrega el motor. Si un dato no está, di explícitamente que no está disponible.
2. NO calcules ni cambies las probabilidades: ya vienen calculadas. Tu trabajo es EXPLICARLAS.
3. NO prometas resultados. Prohibido usar frases como "apuesta segura", "garantizado", "gana sí o sí", "dinero fácil", "sin riesgo" o similares.
4. Explica la incertidumbre con honestidad: menciona qué puede salir mal y por qué el rival podría ganar.
5. Compara a los equipos de forma objetiva, sin favoritismos ni lenguaje sensacionalista.
6. Respeta el nivel de riesgo que te da el motor. Si el riesgo es ALTO o EXTREMO, recomiéndalo con cautela o sugiere no apostar.
7. Recomienda mercados alternativos SOLO cuando el motor los proponga y tengan sentido.
8. Escribe en español claro y sencillo, para una persona normal, sin jerga estadística innecesaria.
9. Cierra SIEMPRE con la advertencia responsable que te den.
10. Devuelve una respuesta breve y estructurada (máximo ~180 palabras).

FORMATO DE SALIDA:
- Veredicto (1 frase con el favorito y su probabilidad, o "partido parejo").
- Por qué (2-3 razones concretas basadas en los factores).
- Riesgo y cautela (1-2 frases).
- Mercado sugerido (si aplica).
- Advertencia responsable (exactamente la que se te entrega).`;

/**
 * Construye el mensaje de usuario con TODOS los datos que la IA puede usar.
 * Al entregar cifras ya calculadas, minimizamos alucinaciones.
 */
export function buildUserPrompt(input: MatchInput, prediction: Prediction): string {
  const { home, away, context, odds } = input;
  const p = prediction;
  const pctFn = (n: number) => `${Math.round(n * 100)}%`;

  return `PARTIDO: ${home.name} (local) vs ${away.name} (visitante) — deporte: ${input.sport}

DATOS DE EQUIPOS (solo estos, no agregues otros):
- ${home.name}: forma últimos 5 = ${home.formLast5Ppg} pts/partido, goles a favor/juego = ${home.goalsForPerGame}, goles en contra/juego = ${home.goalsAgainstPerGame}, posición = ${home.tablePosition}/${home.leagueSize}, descanso = ${home.restDays} días, impacto de bajas = ${home.keyInjuriesImpact}, sentimiento noticias = ${home.newsSentiment}
- ${away.name}: forma últimos 5 = ${away.formLast5Ppg} pts/partido, goles a favor/juego = ${away.goalsForPerGame}, goles en contra/juego = ${away.goalsAgainstPerGame}, posición = ${away.tablePosition}/${away.leagueSize}, descanso = ${away.restDays} días, impacto de bajas = ${away.keyInjuriesImpact}, sentimiento noticias = ${away.newsSentiment}

CONTEXTO:
- Importancia del torneo: ${context.competitionImportance}
- Historial directo (victorias del local): ${pctFn(context.h2hHomeWinRate)} sobre ${context.h2hSampleSize} enfrentamientos
${odds ? `- Momios (decimal): local ${odds.home}, empate ${odds.draw}, visitante ${odds.away}` : "- Momios: NO DISPONIBLES"}

RESULTADO DEL MOTOR (usa estas cifras tal cual):
- Probabilidades: ${home.name} ${pctFn(p.probabilities.home)}, empate ${pctFn(p.probabilities.draw)}, ${away.name} ${pctFn(p.probabilities.away)}
- Pick: ${p.pick} (${pctFn(p.pickProbability)})
- Confianza: ${p.confidence.level} (score ${p.confidence.score})
- Riesgo: ${p.risk.level} (score ${p.risk.score})
- Goles esperados: ${p.expectedGoals}
- Factores principales (ventaja para el local, +/-): ${p.factors
    .slice(0, 4)
    .map((f) => `${f.label}: ${f.homeAdvantage}`)
    .join(" | ")}
- Mercados sugeridos: ${p.markets.map((m) => `${m.market} [${m.tag}]`).join(" | ")}
- Señales de valor: ${
    p.value.filter((v) => v.isValue).map((v) => v.outcome).join(", ") || "ninguna"
  }

ADVERTENCIA RESPONSABLE (inclúyela textual al final):
"${p.disclaimer}"

Redacta el análisis siguiendo el formato indicado.`;
}

/**
 * Palabras/expresiones prohibidas. Se usan como filtro de seguridad tanto para
 * la salida de la IA como para cualquier texto de marketing (Sección 13).
 */
export const BANNED_PHRASES = [
  "apuesta segura",
  "apuestas seguras",
  "garantizado",
  "garantizada",
  "gana sí o sí",
  "gana si o si",
  "dinero fácil",
  "dinero facil",
  "sin riesgo",
  "100% seguro",
  "no puede perder",
];

/** Devuelve las frases prohibidas encontradas en un texto (vacío = ok). */
export function findBannedPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.filter((phrase) => lower.includes(phrase));
}
