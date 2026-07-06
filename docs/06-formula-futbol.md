# Fórmula inicial de fútbol + ejemplo

> Sección 6. Corresponde 1:1 con `src/lib/engine/predict.ts`.
> Puedes reproducir el ejemplo con `pnpm engine:demo`.

## Fórmula (v1)

**Paso 1 — Subscores (0–100) por equipo**
```
forma    = normaliza(ppg_ultimos5,        0 .. 3)
ataque   = normaliza(goles_favor/juego, 0.3 .. 3.0)
defensa  = 100 − normaliza(goles_contra/juego, 0.3 .. 3.0)
tabla    = normaliza(tamaño_liga − posición + 1, 1 .. tamaño_liga)
h2h      = win_rate_directo × 100
```

**Paso 2 — Índice de poder base**
```
poder = 0.26·forma + 0.20·ataque + 0.20·defensa + 0.18·tabla + 0.16·h2h
```

**Paso 3 — Ajustes**
```
poder_local    += 8                              (localía)
poder_local    += 1.5 · limita(desc_local − desc_visita, −3, 3)
poder_local    −= 5 · impacto_bajas_local
poder_visita   −= 5 · impacto_bajas_visita
poder_local    += 4 · sentimiento_noticias_local
poder_visita   += 4 · sentimiento_noticias_visita
```

**Paso 4 — Probabilidades**
```
dif        = poder_local − poder_visita
p_local_raw = 1 / (1 + e^(−0.05·dif))
p_empate    = max(0.12, 0.28 · e^(−|dif|/40))
resto       = 1 − p_empate
P(local)    = resto · p_local_raw
P(visita)   = resto · (1 − p_local_raw)
```

**Paso 5 — Mezcla con momios (si hay)**
```
p_mercado = implícita_sin_vig(momios)
P_final   = normaliza( 0.6·P_modelo + 0.4·p_mercado )
```

**Goles esperados (Poisson simple):**
```
λ_local  = (gf_local  + gc_visita) / 2
λ_visita = (gf_visita + gc_local ) / 2
goles_esperados = λ_local + λ_visita
BTTS = (1 − e^(−λ_local)) · (1 − e^(−λ_visita))
```

## Ejemplo con dos equipos ficticios

**Tuzos FC (local)** vs **Rayos United (visita)** — liga de 18 equipos.

| Variable | Tuzos (L) | Rayos (V) |
|---|---|---|
| Forma últimos 5 (ppg) | 2.4 | 1.4 |
| Goles a favor / juego | 2.1 | 1.3 |
| Goles en contra / juego | 0.9 | 1.6 |
| Posición | 2 | 11 |
| Descanso (días) | 5 | 3 |
| Bajas (impacto) | 0 | 1 |
| Noticias (sentimiento) | +0.2 | −0.1 |
| H2H (victorias del local) | 60% | — |
| Momios (decimal) | 1.75 | 4.60 · empate 3.60 | |

**Subscores**
- Tuzos: forma 80.0 · ataque 66.7 · defensa 77.8 · tabla 94.4 · h2h 60.0
- Rayos: forma 46.7 · ataque 37.0 · defensa 51.9 · tabla 41.2 · h2h 40.0

**Poder base**
- Tuzos ≈ 0.26·80 + 0.20·66.7 + 0.20·77.8 + 0.18·94.4 + 0.16·60 = **75.6**
- Rayos ≈ 0.26·46.7 + 0.20·37.0 + 0.20·51.9 + 0.18·41.2 + 0.16·40 = **44.9**

**Ajustes**
- Tuzos: +8 (local) + 1.5·2 (descanso) − 0 (bajas) + 4·0.2 (news) = **+11.8 → 87.4**
- Rayos: − 5·1 (bajas) + 4·(−0.1) = **−5.4 → 39.5**

**Probabilidades**
```
dif = 87.4 − 39.5 = 47.9
p_local_raw = 1/(1+e^(−0.05·47.9)) ≈ 0.917
p_empate    = max(0.12, 0.28·e^(−47.9/40)) ≈ 0.12
resto = 0.88 → P(local) ≈ 0.807 · P(visita) ≈ 0.073
```
Modelo puro: **Tuzos 81% · Empate 12% · Rayos 7%**.

**Mezcla con momios** (implícitas sin vig ≈ Tuzos 57% · Empate 28% · Rayos 15%):
```
Tuzos  = 0.6·0.81 + 0.4·0.57 ≈ 0.715
Empate = 0.6·0.12 + 0.4·0.28 ≈ 0.184
Rayos  = 0.6·0.07 + 0.4·0.15 ≈ 0.101
→ normalizado: Tuzos ~71% · Empate ~18% · Rayos ~10%
```

**Valor:** el modelo da a Tuzos ~81% vs 57% del mercado → **edge grande**, con
momio 1.75 el EV = 0.81·1.75 − 1 = **+0.42** → señal de valor.

> Nota: el modelo mezclado se usa para presentar la probabilidad; el modelo *puro*
> se usa para detectar valor contra el mercado. Así el anclaje al mercado no
> "esconde" las oportunidades que el propio mercado no ve.
