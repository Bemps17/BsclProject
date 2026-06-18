# BSCL — Design system reference

> Complément opérationnel de `AGENTS.md` §2. Les agents chargent ce fichier pour les tâches **D1**, **D6**, **D2**.

## Palette

| Token CSS | Hex | Usage |
|-----------|-----|--------|
| `--background` | `#0B0B0B` | Fond page |
| `--card` / `--surface` | `#111827` | Cartes, sidebar, topbar |
| `--secondary` / `--surface2` | `#162032` | Panneaux imbriqués, inputs |
| `--border` | `#1E2D45` | Bordures |
| `--primary` | `#0066FF` | CTA, nav active, accent ELO (mode live) |
| `--gold` | `#F59E0B` | Rang #1, prix, check-in, highlights « chauds » |
| `--gold-muted` | `#D97706` | Or atténué, hover |
| `--green` | `#22C55E` | Victoire, online |
| `--red` | `#EF4444` | Défaite, erreurs |
| `--muted-foreground` | `#9CA3AF` | Labels, texte secondaire (contraste WCAG AA sur fond sombre) |

### Mode démo

Quand `[data-demo-mode]` est actif sur le document, `--primary` bascule sur l'or (`#F59E0B`) pour distinguer visuellement le parcours invité du mode Standard.

## Règle or vs bleu

**Ne pas** utiliser `--gold` et `--primary` (bleu) comme deux accents concurrents de même poids sur un même écran en mode live.

- **Bleu** : navigation, actions primaires, ELO, liens actifs.
- **Or** : podium (#1), récompenses, check-in tournoi, badges « premium » ponctuels.

En mode démo, l'or devient la couleur primaire — les surfaces restent sombres ; éviter d'ajouter un second accent bleu vif sur la même vue.

## Typographie

| Rôle | Variable | Police |
|------|----------|--------|
| Titres / stats | `--font-heading` | Sora |
| Corps | `--font-sans` | Montserrat |
| Scores / IDs | `--font-mono` | JetBrains Mono |

## Composants

Réutiliser `src/components/bscl/ui.tsx` (`Card`, `StatCell`, `RankBadge`, `MatchRow`, …) et `src/components/ui/*` (shadcn) avec tokens BSCL — pas de hex ad hoc dans les pages.

## Accessibilité (cibles playbook)

- Touch targets ≥ 44px (tab bar, sélecteur de langue)
- Skip link → `#main` (tâche D3) ✅
- Focus trap menu More (tâche D4) — page `/more` (navigation standard)
- `aria-pressed` sur filtres toggle ✅
- `aria-current="page"` sur nav active (sidebar + tab bar) ✅
- Couleur + texte pour WIN/LOSS ✅
- `--muted-foreground: #9CA3AF` — ratio ≥ 4.5:1 sur `--card` / `--background`
- Anneau de focus `:focus-visible` 2px (`--ring`)
- `prefers-reduced-motion` pour pulse / transitions

## Livrables design (PR)

Captures **Avant/Après**, viewport **390px**, thème sombre (mode live ou démo selon la page).
