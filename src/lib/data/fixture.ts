// Tipo de partido usado por toda la app (UI + motor). Independiente del
// proveedor de datos: mock hoy, API-Football mañana, misma forma.
import type { MatchInput, Sport } from "../types";

export interface Fixture {
  id: string;
  sport: Sport;
  league: string;
  /** ISO string del inicio del partido. */
  kickoff: string;
  status: "scheduled" | "live" | "finished";
  input: MatchInput;
}
