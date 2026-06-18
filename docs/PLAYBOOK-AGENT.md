# Playbook Agent — Unified Model System (BSCL)

> **Usage :** Charger ce fichier unique pour toute tâche liée à la **qualité** (tests, hooks, dette), au **design/UX** (tokens, accessibilité, refactor) ou à la **sécurité** (durcissement, auth, middleware).
> **Langage :** Instructions impératives, critères vérifiables, périmètre strict.
> **Complément :** Lire aussi `AGENTS.md` (contexte produit, parcours utilisateur, gates Phase 7).

---

## Contexte & contraintes repo

### Stack technique

| Item | Valeur |
|------|--------|
| Framework | Next.js 16 App Router, React 19, TypeScript strict |
| UI | Tailwind v4, shadcn/ui (`src/components/ui/`), couche BSCL (`src/components/bscl/`) |
| Data | Prisma 7, PostgreSQL (Neon), Auth.js (Discord) |
| Tests | **Vitest** (`npm test`) — ne pas introduire Jest sans demande explicite |
| Bot | Discord.js dans `bot/` (package séparé) |

### Vérification globale

```bash
npm run verify          # lint + test + build
npm run verify:technical # lint + test (sans build)
```

### Règle d'or

Ne pas refactorer hors périmètre de la tâche active. Ne pas introduire de lib UI massive au-delà de shadcn déjà présent.

### Design & UX

- Thème **Dark Esports** — tokens dans `src/app/globals.css` et section 2 de `AGENTS.md`
- Règle **60-30-10** : fond sombre dominant, surfaces secondaires, accent bleu `#0066FF` pour actions primaires
- **Or** (`#F59E0B`) : rang #1, prix, check-in — voir `docs/DESIGN.md`
- **Mobile-first** : touch targets ≥ 44px sur les actions principales
- **Icônes** : `src/components/bscl/icons.tsx`, `src/lib/nav-icons.ts`

### Sécurité

- **Zéro Trust** : ne jamais committer de secrets ; pas de MCP serveur sans approbation explicite
- **Modèle d'accès** : Discord OAuth pour le mode live ; cookie `bscl_demo=1` pour le mode démo ; middleware sur les routes plateforme (`src/middleware.ts`)
- **Rôles** : `requireAuth()` / `hasRole()` dans `src/lib/auth.ts` — jamais de garde UI seule pour les mutations sensibles

---

## Matrice globale de priorités & exécution

Ordre recommandé pour minimiser les régressions :

`D1 → D6 → Q1 → Q2 → S2/Q5 → S1 → D2 → D7 → D3 → D4 → Q7 → Q3 → Q4 → D5 → S3 → S4 → S5 → S6 → S7 → Q6`

> **Branches/PRs :** Une PR par tâche indépendante. Messages conventionnels : `fix(quality): …`, `style(design): …`, `chore: …`
>
> **Livrable UI :** Chaque PR de design inclut des captures Avant/Après (viewport 390px ; mode démo si pertinent).

---

## Axe Qualité (Q) & robustesse

### TÂCHE Q1 — Vérifier `response.ok` sur mutations queue / match

**Objectif :** Rendre visibles les échecs API (401, 403, 409, 500) après join/leave queue et soumission de résultat.

**Fichiers :**

- `src/app/(platform)/play/play-client.tsx` (live queue)
- Clients match result si extraits : `src/app/(platform)/matches/`, routes API consommées
- Helper partagé recommandé : `src/lib/fetch-client.ts`

**Étapes :**

1. Créer `async function fetchOrThrow(input, init)` qui throw si `!res.ok` (inclure le corps JSON `{ error }` si présent).
2. L'utiliser dans `play-client.tsx` pour POST/DELETE `/api/queue` (remplacer ou compléter les checks manuels existants).
3. Appliquer le même pattern aux fetch de résultat/confirm/dispute quand les clients live seront branchés.
4. En cas d'échec : resynchroniser l'état (`fetchQueue()` / `mutate`) — pas d'état optimiste incohérent sans retry.
5. Exposer l'erreur via state UI (`setError`) ou `aria-live` — pas uniquement `console.error`.

**Critères d'acceptation :**

- [ ] POST/DELETE queue avec session valide : comportement inchangé
- [ ] Simulation 401/409/500 : signal d'erreur visible dans l'UI
- [ ] `npm run verify:technical` au vert

**NE PAS FAIRE :** Modifier la logique métier des routes API ; ajouter une lib toast lourde (préférer `Alert` shadcn ou bannière dans la page).

---

### TÂCHE Q2 — Vérifier `response.ok` sur mutations démo / local-store

**Objectif :** Même robustesse pour les appels `/api/demo/*` et les transitions `DemoProvider`.

**Fichiers :**

- `src/app/login/login-welcome.tsx`
- `src/components/bscl/demo-exit-button.tsx`
- `src/app/login/switch-mode-link.tsx`
- `src/components/bscl/demo-provider.tsx`

**Étapes :**

1. Appliquer `fetchOrThrow` (ou gestion explicite `!res.ok`) sur POST `/api/demo/enter` et DELETE `/api/demo/exit`.
2. Afficher un message court si le cookie démo ne peut pas être posé/supprimé.
3. Dans `demo-provider`, propager les erreurs métier (queue pleine, match invalide) jusqu'au composant appelant.

**Critères d'acceptation :**

- [ ] Entrée/sortie démo fonctionne comme avant en nominal
- [ ] Échec réseau ou 500 : l'utilisateur voit un retour, pas un état silencieux
- [ ] `npm run verify:technical` au vert

---

### TÂCHE Q3 — Supprimer le code mort (Lot 1)

**Objectif :** Nettoyer les composants non importés sous `src/components/`.

**Étapes :**

1. Pour chaque candidat, valider l'absence d'import :
   ```bash
   rg -l "NomDuComposant" --glob '!**/NomDuComposant.tsx'
   ```
2. Si aucun résultat hors du fichier lui-même → `git rm`.
3. Lancer `npm run build`.

**Candidats typiques :** anciens wrappers pré-shadcn, doublons remplacés par `src/components/bscl/ui.tsx`.

**Critères d'acceptation :**

- [ ] Aucun import cassé
- [ ] Build OK

**NE PAS FAIRE :** Supprimer `AppShell`, `DemoProvider`, `ButtonLink`, primitives shadcn.

---

### TÂCHE Q4 — Supprimer intégrations API / scripts morts

**Objectif :** Nettoyer dépendances, scripts `package.json` et fichiers `src/lib/` non référencés.

**Étapes :**

1. Scanner : `rg "import.*from" src/ bot/` + recoupement avec `package.json` scripts.
2. Supprimer fichiers et scripts obsolètes.
3. Mettre à jour `README.md` si une intégration supprimée y était documentée.

**Critères d'acceptation :**

- [ ] `npm run verify` au vert

---

### TÂCHE Q7 — Auto-flow démo sans eslint-disable

**Objectif :** Éviter les `useEffect` + sérialisation JSON fragiles dans le parcours démo (draft → match).

**Fichiers :**

- `src/components/bscl/demo-match-flow.tsx`
- `src/components/bscl/demo-provider.tsx`

**Étapes :**

1. Déclencher le remplissage bot / démarrage match via actions explicites ou ref « déjà amorcé » au premier mount.
2. Conserver les boutons manuels (Fill bots, Start) comme filet de sécurité.
3. Retirer tout `eslint-disable-next-line react-hooks/exhaustive-deps` sans justification.

**Critères d'acceptation :**

- [ ] Aucune boucle infinie sur les mises à jour d'état démo
- [ ] Parcours queue → draft → match inchangé côté UX

---

### TÂCHE Q6 — Aligner la roadmap sur l'état du repo

**Objectif :** Synchroniser `README.md` (phases 7a–7k, M1–M7) et version `package.json`.

**Fichiers :**

- `README.md`
- `AGENTS.md` section 10
- `package.json` (`version`)

**Étapes :**

1. Cocher/décocher les étapes selon l'état réel (live vs démo).
2. Mentionner les PR/issues récentes si pertinent (#N).
3. S'assurer que la version documentée correspond à `package.json`.

**Critères d'acceptation :**

- [ ] Aucune contradiction entre README et AGENTS.md sur Phase 7

---

## Axe Design & accessibilité (D)

### TÂCHE D1 — Définir les tokens manquants (P0 Design)

**Objectif :** Résoudre toutes les variables `var(--…)` orphelines sur les pages actives.

**Fichier :** `src/app/globals.css` (`:root`)

**Étapes :**

1. Ajouter les alias sémantiques BSCL si absents :
   ```css
   --gold: #f59e0b;
   --gold-muted: #d97706;
   --blue-glow: rgba(0, 102, 255, 0.28);
   --green: #22c55e;
   --red: #ef4444;
   ```
2. Alias legacy pour rétrocompatibilité (si classes arbitraires `#…` encore présentes) :
   ```css
   --surface: var(--card);
   --surface2: var(--secondary);
   --text-muted: var(--muted-foreground);
   ```
3. Auditer : `rg "var\\(--" src/app src/components`

**Critères d'acceptation :**

- [ ] Éléments or / rang #1 visibles sur `/rankings`, `/profile`, mode démo
- [ ] Contraste WCAG AA sur boutons de filtre actifs

**NE PAS FAIRE :** Changer `--primary` (#0066FF) sans demande explicite.

---

### TÂCHE D6 — Documenter le token Or

**Objectif :** Source de vérité design pour l'or.

**Fichier :** `docs/DESIGN.md`

**Règle métier :** Ne pas exploiter l'or et le bleu primaire au même niveau hiérarchique sur un même écran (sauf mode démo où `--primary` devient or via `[data-demo-mode]`).

---

### TÂCHE D2 — Refactor page `/teams`

**Objectif :** Aligner visuellement sur le shell premium (comme `/rankings`).

**Fichiers :**

- `src/app/(platform)/teams/teams-client.tsx`
- `src/app/(platform)/teams/teams-demo.tsx`
- `src/components/bscl/ui.tsx` (réutiliser `Card`, `StatCell`)

**Étapes :**

1. En-tête cohérent (titre via shell + sous-titre i18n).
2. Remplacer couleurs hex legacy par tokens / classes sémantiques.
3. Filtres en pills avec `aria-pressed`.

**Critères d'acceptation :**

- [ ] Rendu proche de `/rankings`
- [ ] Touch targets ≥ 44px
- [ ] `npm run verify:technical` au vert

---

### TÂCHE D7 — Nettoyage polices résiduelles

**Objectif :** Aucun fallback générique sur les titres.

**Fichiers :**

- `src/app/layout.tsx` (Sora, Montserrat, JetBrains Mono)
- Composants utilisant des polices hors `--font-heading` / `--font-sans`

**Critères d'acceptation :**

- [ ] Titres en Sora (`font-heading`) ; corps en Montserrat (`font-sans`) ; scores/IDs en JetBrains Mono

---

### TÂCHE D3 — Skip link accessibilité

**Objectif :** Accès clavier direct au contenu principal.

**Fichiers :**

- `src/components/bscl/shell.tsx`
- `src/app/globals.css`

**Étapes :**

1. Premier enfant focusable :
   ```tsx
   <a href="#main" className="skip-link">Skip to content</a>
   ```
2. Vérifier `<main id="main">` unique dans le shell.
3. CSS `.skip-link` : invisible par défaut, visible au `:focus`, `z-index` au-dessus de la tabbar.

**Critères d'acceptation :**

- [ ] Tab au chargement affiche le skip link
- [ ] Enter déplace le focus dans `main`

---

### TÂCHE D4 — Focus trap menu « More »

**Objectif :** Menu mobile/desktop accessible au clavier.

**Fichier :** `src/components/bscl/more-menu.tsx`

**Étapes :**

1. Focus initial sur le premier élément interactif à l'ouverture.
2. Tab cyclique à l'intérieur du menu.
3. Escape ferme et restaure le focus sur le déclencheur.

**Critères d'acceptation :**

- [ ] Implémentation légère (< 30 lignes de logique focus)
- [ ] Le focus ne s'échappe pas tant que le menu est ouvert

---

### TÂCHE D5 — Nettoyer composants legacy design

**Objectif :** Supprimer résidus après D2.

**Étapes :** Même procédure que Q3, cibler les composants teams/groups devenus orphelins.

---

## Axe Sécurité & durcissement (S)

### TÂCHE S1 — Tests API status / cron sans secret en dur

**Objectif :** Documenter et tester que les endpoints sensibles rejettent les appels non authentifiés.

**Fichiers :**

- `src/app/api/status/route.ts`
- Tests Vitest : `src/app/api/status/route.test.ts` (à créer)

**Étapes :**

1. Cas erreur : GET sans credentials attendus → 401/503 selon config.
2. Cas passant : avec env de test documenté ; `test.skip` si variable absente en CI.
3. Aucun secret en dur dans le code de test.

**Critères d'acceptation :**

- [ ] Comportement commenté dans le fichier de test

---

### TÂCHE S2 / Q5 — Tests mutation 401/403 & garde session

**Objectif :** Couvrir le rejet des mutations sans session Discord (mode live).

**Fichiers :**

- `src/app/api/queue/route.test.ts` (existe — étendre)
- `src/lib/auth.ts`

**Étapes :**

1. POST `/api/queue` sans session → 401.
2. POST avec utilisateur banni → 403.
3. Conditionner avec skip si DB indisponible.

**Critères d'acceptation :**

- [ ] Adéquation stricte avec `requireAuth()` dans les handlers

---

### TÂCHE S3 — Durcir `/api/status` (pas de DDL auto en production)

**Objectif :** L'endpoint de santé ne doit pas migrer le schéma automatiquement en production.

**Fichiers :**

- `src/app/api/status/route.ts`
- `docs/security.md`

**Étapes :**

1. Bootstrap schéma uniquement en `development` ou via flag explicite + secret cron.
2. Health normal en prod : `schemaReady: false` + message « run db:migrate » si tables absentes.

---

### TÂCHE S4 — Content Security Policy (CSP)

**Objectif :** Ajouter ou durcir la CSP dans `src/middleware.ts` sans `unsafe-eval` si le build le permet.

**Étapes :**

1. Ajouter en-têtes CSP sur les réponses HTML.
2. Valider : `npm run build && npm test`.
3. Si échec runtime : revert documenté dans `docs/security.md`.

---

### TÂCHE S5 — Documentation secrets GitHub / déploiement

**Objectif :** Checklist opérationnelle (pas de code prod).

**Fichiers :**

- `docs/security.md`
- `.github/workflows/*` (si présents)

**Contenu :** `AUTH_SECRET`, `DATABASE_URL`, Discord OAuth redirects, exemple `curl` sans valeurs réelles.

---

### TÂCHE S6 — Rôle Postgres minimal (Neon)

**Objectif :** Moindre privilège pour l'app.

**Fichiers :**

- `scripts/neon-roles.sql` (nouveau, optionnel)
- `docs/security.md`

**Exemple :**

```sql
CREATE ROLE bscl_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO bscl_app;
-- Affiner par table : User, Match, QueueEntry, EloHistory, …
```

**Critères :** Aucun mot de passe dans le script.

---

### TÂCHE S7 — Robustesse import profil / payloads JSON

**Objectif :** Rejeter pollution de prototype et payloads surdimensionnés.

**Fichiers :**

- Validators Zod dans `src/lib/validators/`
- Tests : `src/lib/validators/*.test.ts`

**Étapes :**

1. Cas `__proto__`, `constructor`, tableaux > limites définies.
2. `npm test`

**Critères d'acceptation :**

- [ ] Rejet explicite sans crash process

---

## Référence rapide BSCL

| Domaine | Chemin |
|---------|--------|
| Shell / nav | `src/components/bscl/shell.tsx` |
| Démo | `src/components/bscl/demo-provider.tsx` |
| Middleware gate | `src/middleware.ts` |
| Auth | `src/lib/auth.ts` |
| Backend flags | `src/lib/backend.ts` |
| Tokens CSS | `src/app/globals.css` |
| Guide agent | `AGENTS.md` |
| Design tokens | `docs/DESIGN.md` |
| Sécurité ops | `docs/security.md` |
| Schéma | `prisma/schema.prisma` |

---

## Mapping origine WC2026 → BSCL

| Playbook d'origine | Équivalent BSCL |
|--------------------|-----------------|
| `hooks/useScores.ts` | Clients API queue/match + `play-client.tsx` |
| `hooks/useBracket.ts` | `demo-provider` / futur brackets tournoi |
| `npm run verify` + Playwright | `npm run verify` (lint + test + build) ; E2E Phase 7e |
| `ROADMAP.md` v0.9.4 | `README.md` + `AGENTS.md` §10 |
| `components/icons/AppIcon.tsx` | `src/components/bscl/icons.tsx` |
| `lib/api-football.ts` | N/A — auditer imports morts (Q4) |
| `/api/sync` + cron | `/api/status` + jobs futurs |
| `MatchCard.tsx` V1 | Composants pré-M5 sous `src/components/` |
