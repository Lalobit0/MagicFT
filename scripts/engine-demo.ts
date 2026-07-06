// ==========================================================================
// Demo del motor sin levantar la app. Ejecuta:  pnpm engine:demo
// Corre las 4 predicciones de ejemplo y las imprime en consola.
// ==========================================================================
import { getAllMatches } from "../src/lib/data/matches";
import { predict } from "../src/lib/engine/predict";

async function main() {
  const fixtures = await getAllMatches();
  for (const f of fixtures) {
    const p = predict(f.input);
    const { home, away } = f.input;
    console.log("\n" + "=".repeat(70));
    console.log(`${home.name} vs ${away.name}  (${f.league})`);
    console.log("-".repeat(70));
    console.log(
      `Probabilidades  → ${home.name}: ${(p.probabilities.home * 100).toFixed(0)}% | ` +
        `Empate: ${(p.probabilities.draw * 100).toFixed(0)}% | ` +
        `${away.name}: ${(p.probabilities.away * 100).toFixed(0)}%`
    );
    console.log(`Pick            → ${p.pick} (${(p.pickProbability * 100).toFixed(0)}%)`);
    console.log(`Confianza       → ${p.confidence.level} (${p.confidence.score})`);
    console.log(`Riesgo          → ${p.risk.level} (${p.risk.score})`);
    console.log(`Goles esperados → ${p.expectedGoals}`);
    console.log(`Mercado top     → ${p.markets[0]?.market ?? "—"}`);
    const value = p.value.filter((v) => v.isValue).map((v) => v.outcome);
    console.log(`Valor detectado → ${value.length ? value.join(", ") : "ninguno"}`);
    console.log(`\n${p.explanation}`);
  }
  console.log("\n" + "=".repeat(70));
}

main();
