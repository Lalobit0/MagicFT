import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MagicFT — Análisis deportivo con IA",
  description:
    "Analiza partidos con probabilidad, confianza, riesgo y mercados recomendados. Plataforma de análisis, no una casa de apuestas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-pitch-700/60">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
              <span className="text-accent">Magic</span>FT
              <span className="pill bg-pitch-700 text-accent-soft">beta</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-pitch-100/80">
              <Link href="/" className="hover:text-accent">
                Partidos
              </Link>
              <Link href="/planes" className="hover:text-accent">
                Planes
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

        <footer className="mt-12 border-t border-pitch-700/60">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed text-pitch-100/50">
            MagicFT es una plataforma de análisis y probabilidad con fines informativos. No
            garantiza resultados ni vende apuestas seguras. Apostar implica riesgo de pérdida
            económica. Juega con responsabilidad. Solo para mayores de 18 años.
          </div>
        </footer>
      </body>
    </html>
  );
}
