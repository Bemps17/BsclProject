# BSCL — Agent Guide

> **Black Squad Competitive League** · [bscl.gg](https://bscl.gg)  
> Canonical instructions for AI agents and contributors working on this repository.

**Playbook tâches (qualité / design / sécurité) :** [`docs/PLAYBOOK-AGENT.md`](docs/PLAYBOOK-AGENT.md) — charger ce fichier pour exécuter les tâches Q*, D*, S* avec périmètre strict.  
**Références :** [`docs/DESIGN.md`](docs/DESIGN.md) · [`docs/security.md`](docs/security.md)

---

## 1. Project context

| Item | Value |
|------|--------|
| Product | FACEIT-like competitive platform for Black Squad |
| Primary language (UI + copy) | **English** (default) · **French** via i18n toggle |
| Domain | `bscl.gg` |
| Stack | Next.js 16 · React · TypeScript · Tailwind v4 · shadcn/ui · Prisma 7 · PostgreSQL · Auth.js · Discord.js |
| Layout | Mobile-first shell → sidebar on `≥768px` |

**Before writing Next.js code:** this repo may use Next.js 16 APIs that differ from older versions. Check `node_modules/next/dist/docs/` for deprecations.

---

## 2. Design system

All UI must follow the **Dark Esports** theme. Do not introduce new palettes, fonts, or layout patterns without updating this file.

### 2.1 Design tokens

Use these values consistently. Prefer CSS variables in `globals.css` or Tailwind arbitrary values already used in the codebase.

| Token | Hex / value | Usage |
|-------|-------------|--------|
| `--bg` | `#0B0B0B` | Page background |
| `--surface` | `#111827` | Cards, topbar, sidebar |
| `--surface2` | `#162032` | Nested panels, inputs |
| `--border` | `#1E2D45` | All borders |
| `--blue` | `#0066FF` | Primary actions, active nav, ELO accent |
| `--blue-glow` | `rgba(0,102,255,.28)` | Primary button glow |
| `--text` | `#E5E7EB` | Body text |
| `--muted` | `#6B7280` | Secondary text, labels |
| `--green` | `#22C55E` | Win, online, positive delta |
| `--red` | `#EF4444` | Loss, errors, sanctions |
| `--gold` | `#F59E0B` | #1 rank, prizes, check-in |

### 2.2 Typography

| Role | Font | Weight | Where |
|------|------|--------|-------|
| Headings / stats | Rajdhani (`--font-rajdhani`) | 600–700 | Titles, ELO numbers, queue labels |
| Body | Inter (`--font-inter`) | 400–600 | Paragraphs, tables, buttons |
| Scores / IDs | JetBrains Mono (`--font-jetbrains`) | 500–700 | Match scores, ticket IDs, ELO deltas |

**Rules:**
- Section labels: `10px`, uppercase, `letter-spacing: 1–1.5px`, `--muted`
- Stat values: Rajdhani `28–36px`, bold
- Never use system default fonts for branded surfaces

### 2.3 Spacing & layout

| Breakpoint | Shell |
|------------|--------|
| `<768px` | Topbar (compact) → scrollable main → **fixed bottom tab bar** (64px + safe-area) |
| `≥768px` | Sidebar 240px (`lg`: 252px), full viewport height, topbar 56px, scrollable main |

| Constant | Value |
|----------|-------|
| Page padding (mobile) | `16px` |
| Page padding (desktop) | `24px` |
| Card radius | `12px` (`rounded-xl`) |
| Button radius | `8px` |
| Min touch target | `44px` (WCAG) |
| Max content width | `md:max-w-4xl` → `xl:max-w-6xl` → `2xl:max-w-7xl` centered in main |

### 2.4 Components — use existing primitives

**Always reuse before creating new UI:**

| Component | Path | Use for |
|-----------|------|---------|
| `AppShell`, `Sidebar`, `Topbar`, `Tabbar` | `src/components/bscl/shell.tsx` | Page layout |
| `LocaleProvider`, `LanguageSwitcher` | `src/components/bscl/locale-provider.tsx` | EN/FR i18n |
| `DemoProvider` | `src/components/bscl/demo-provider.tsx` | Guest profile + local queue |
| `Card`, `CardHeader`, `StatCell`, `RankBadge`, `Tag`, `MatchRow`, `TableScroll`, `LogoHex` | `src/components/bscl/ui.tsx` | Content blocks |
| `Button` | `src/components/ui/button.tsx` | shadcn base (extend with BSCL tokens) |
| Nav config | `src/lib/constants.ts` | `NAV_ITEMS`, `RANK_*` |
| Translations | `src/lib/i18n/en.ts`, `fr.ts` | All user-facing copy |

**Component patterns:**
- **Primary CTA:** `bg-[#0066FF]` + blue glow shadow
- **Ghost CTA:** `bg-[#162032]` + `border-[#1E2D45]`
- **Stat strip:** 2 cols mobile → 4 cols desktop
- **Rank badges:** use `RankBadge` + `RANK_STYLES` from constants — never hardcode rank colors elsewhere
- **Active nav:** blue text + top indicator (mobile) or left border (sidebar)
- **Cards:** `bg-[#111827]`, `border-[#1E2D45]`, top accent line on stat cells

### 2.5 Motion & feedback

- Page enter: subtle fade-up (`opacity` + `translateY`, ~200ms)
- Active tab: scale icon `1.12`
- Buttons: `active:scale-[.97]` on primary
- Online indicator: pulsing green dot
- Avoid heavy animation, parallax, or light themes

### 2.6 Accessibility

- [ ] Touch targets ≥ 44px on mobile
- [ ] Color is not the only indicator (WIN/LOSS uses text + color)
- [ ] `theme-color: #0B0B0B`, `viewport-fit=cover` for notched devices
- [ ] Semantic headings inside each page (one `h1` via topbar title on desktop)
- [ ] Form inputs: visible focus ring (`outline-ring/50`)

### 2.7 Do / Don't

| Do | Don't |
|----|-------|
| Extend `src/components/bscl/ui.tsx` for shared patterns | Create one-off styled divs duplicated across pages |
| Keep demo data out of pages — use API or demo provider | Hardcode player names inside page components |
| Use `useT()` / `src/lib/i18n/` for user-facing strings | Add English-only strings without FR translation |
| Match the HTML mockup / existing pages | Import generic light shadcn theme without BSCL tokens |

---

## 3. User journeys

Agents must preserve these flows end-to-end. Any feature change should be checked against the relevant journey.

### 3.1 Player — first visit

```mermaid
flowchart LR
  A[Landing /] --> B{Logged in?}
  B -->|No| C[/login Discord OAuth]
  C --> D[Profile auto-created 1000 ELO]
  B -->|Yes| E[Home dashboard]
  D --> E
  E --> F[Play / Rankings / Teams]
```

### 3.2 Player — PUG match (5v5)

```mermaid
flowchart TD
  A[Join queue] --> B{10 players?}
  B -->|No| A
  B -->|Yes| C[Select Captain Alpha + Bravo]
  C --> D[Snake draft 8 picks]
  D --> E[Match LIVE]
  E --> F[Captain submits /result]
  F --> G[Opposing captain /confirm]
  G --> H[ELO updated + history]
  F --> I[/dispute] --> J[Moderator ticket]
```

**Web parity:** `/play` queue UI ↔ `/api/queue` ↔ bot `/join` `/leave` `/queue`  
**Invariant:** 10 players, 5v5, snake order `A,B,B,A,A,B,B,A`

### 3.3 Captain

- Can submit match results (`SUBMITTED`)
- Can confirm opponent results (`CONFIRMED`)
- Same queue/draft flow as player

### 3.4 Team manager

```mermaid
flowchart LR
  A[/teams] --> B[Create team]
  B --> C[Upload logo · invite players]
  C --> D[Accept invitations]
  D --> E[Assign co-captain · transfer captain]
  E --> F[Tournament registration]
```

### 3.5 Tournament participant

Register → check-in window → bracket (BO1/BO3/BO5) → results → prize display

### 3.6 Support / dispute

Categories: `MATCH_DISPUTE`, `PLAYER_REPORT`, `TECHNICAL`, `APPEAL`, `GENERAL`  
Statuses: `OPEN` → `ANSWERED` → `CLOSED`  
Disputed matches: `DISPUTED` → moderator review via `/tickets` or admin

### 3.7 Staff roles

| Role | Access |
|------|--------|
| `PLAYER` | Queue, teams, profile, tickets |
| `CAPTAIN` | + submit/confirm results |
| `MODERATOR` | + disputes, tickets, sanctions |
| `ADMIN` | + `/admin` CRUD, news, seasons |
| `OWNER` | Full system |

**Rule:** enforce via `requireAuth()` / `hasRole()` in `src/lib/auth.ts` — never UI-only gating for sensitive actions.

### 3.8 Key routes map

| Route | Journey step |
|-------|----------------|
| `/` | Home / season overview |
| `/play` | Queue |
| `/rankings` | Leaderboard |
| `/teams` | Team management |
| `/profile` | Stats + rank progress |
| `/matches` | History |
| `/tournaments` | Events |
| `/tickets` | Support |
| `/admin` | Staff only |
| `/login` | Discord OAuth (no AppShell) |

---

## 4. Domain rules (do not break)

### 4.1 ELO (`src/lib/elo.ts`)

| Rule | Value |
|------|-------|
| Starting ELO | 1000 |
| Placement matches | 5 (protection: halved loss) |
| K-factor | 32 |
| Visible rating | ELO |
| Hidden rating | MMR |
| MVP bonus | Disabled |
| Season reset | Soft reset (`softResetElo`) |

**Rank thresholds:** Bronze 0 · Silver 1000 · Gold 1200 · Platinum 1400 · Diamond 1600 · Elite 1800+

### 4.2 Match states

`DRAFT` → `LIVE` → `SUBMITTED` → `CONFIRMED`  
Branches: `DISPUTED`, `CANCELLED`

### 4.3 Discord bot commands (`bot/`)

`/join` · `/leave` · `/queue` · `/result` · `/confirm` · `/dispute` · `/profile` · `/team` · `/support` · `/admin`

Bot and API must stay in sync for queue and match lifecycle.

---

## 5. Architecture conventions

```
src/
  app/
    (platform)/       # Routes wrapped in AppShell
    api/              # REST handlers only — no UI
    login/            # Auth outside shell
  components/bscl/    # Design-system components
  lib/                # prisma, auth, elo, constants
  generated/prisma/   # Prisma client (do not edit)
prisma/schema.prisma
bot/                  # Separate package — excluded from Next tsconfig
```

**Rules:**
- Imports at top of file — no inline imports
- Exhaustive `switch` with `never` in default for union types
- Minimize diff scope — match existing patterns
- API routes return JSON; use proper HTTP status codes (401/403/409)
- Server auth: `getSessionUser()` / `requireAuth(role)`
- Never commit `.env` — use `.env.example`

---

## 6. Mandatory security checklist

**Run before every PR.** An agent must not mark work complete until all applicable items pass.

### 6.1 Authentication & authorization

- [ ] Discord OAuth required for player actions (no anonymous queue join in production)
- [ ] Session strategy remains database-backed (Auth.js + Prisma adapter)
- [ ] Role checks on every mutating API route and server action
- [ ] `/admin` and staff APIs require `MODERATOR` minimum (or `ADMIN` as specified)
- [ ] Banned users (`user.banned`) rejected in `requireAuth()`
- [ ] No secrets in code, logs, or client bundles (`AUTH_SECRET`, bot token, DB URL)

### 6.2 Input validation

- [ ] All API inputs validated (prefer Zod schemas in `src/lib/validators/`)
- [ ] Match scores: positive integers, sensible max (e.g. ≤ 16)
- [ ] Team name/tag length limits enforced server-side
- [ ] File uploads (logos): type whitelist, size cap, virus scan if S3 enabled
- [ ] SQL via Prisma only — no raw string concatenation

### 6.3 API hardening

- [ ] Rate limiting on auth, queue, and ticket endpoints
- [ ] CORS restricted to `bscl.gg` (+ localhost in dev)
- [ ] CSRF protection via Auth.js for session routes
- [ ] Error responses never leak stack traces or DB details in production

### 6.4 Data integrity

- [ ] ELO changes only through confirmed matches (transaction + `EloHistory` audit row)
- [ ] Match confirm requires opposing captain (not same user)
- [ ] Queue: one active entry per player
- [ ] Soft deletes / audit log for admin mutations (`AuditLog` model)

### 6.5 Discord bot

- [ ] Bot token env-only
- [ ] Admin commands verify Discord role or linked BSCL staff role
- [ ] Slash command permissions registered per guild in production

### 6.6 Dependencies & infra

- [ ] No known critical CVEs in `npm audit` for touched packages (document exceptions)
- [ ] `DATABASE_URL` uses SSL in production
- [ ] S3 buckets not public-write

---

## 7. Mandatory test checklist

### 7.1 Always run before push

```bash
npm run verify         # lint + test + build (gate PR)
npm run verify:technical  # lint + test (rapide)
npm test               # Vitest — 67+ unit/integration tests
npm run test:coverage  # Optional coverage report
npm run build          # TypeScript + Next.js production build
npm run lint           # ESLint
```

### 7.2 When touching ELO / matches

- [x] Unit tests in `src/lib/elo.test.ts` — delta, ranks, soft reset, placement protection
- [x] Unit tests in `src/lib/match.test.ts` — snake draft, queue snapshot, confirm rules
- [x] Validators in `src/lib/validators/match.test.ts`
- [ ] Confirm → ELO update is idempotent (integration test, Phase 7)

### 7.3 When touching auth / API

- [x] `src/lib/auth.test.ts` — role hierarchy, banned, forbidden
- [x] `src/app/api/queue/route.test.ts` — 401, 409, 400, success paths
- [x] `src/lib/validators/team.test.ts` — team name/tag validation

### 7.4 When touching UI

- [ ] Verify mobile (375px) and desktop (≥768px) layouts
- [ ] Bottom tab bar not overlapping content (`padding-bottom` on main)
- [ ] Active nav state matches current route
- [ ] New components use design tokens (section 2)

### 7.5 When touching bot

```bash
npm test   # includes bot/src/lib/queue.test.ts
cd bot && npm run build
```

### 7.6 Pre-release (Phase 7+)

- [ ] Integration test: OAuth login → join queue → mock match → ELO change
- [ ] Security review of admin CRUD
- [ ] Load test queue endpoint (concurrent joins)

---

## 8. Agent workflow

### 8.1 Starting a task

1. Read this file + relevant page in `src/app/(platform)/`
2. Check `src/lib/constants.ts` and `prisma/schema.prisma`
3. Identify affected user journey (section 3)
4. Plan smallest diff that satisfies the task

### 8.2 During implementation

- Reuse BSCL components (section 2.4)
- Wire to API when data exists — avoid new demo hardcoding
- Log admin actions to `AuditLog`
- Update `.env.example` for new env vars

### 8.3 Before commit

- [ ] Security checklist (section 6) — applicable items
- [ ] Test checklist (section 7) — applicable items
- [ ] No unrelated files in diff
- [ ] Commit message: `feat:` / `fix:` / `chore:` + clear English summary

### 8.4 Before push / PR

- [ ] `npm run build` green
- [ ] Branch name: `cursor/<descriptive-name>-a4b4` (cloud agents)
- [ ] PR describes journey impact + test evidence
- [ ] Draft PR until Phase 7 test gate passed

---

## 9. Environment variables

Document all new variables in `.env.example`:

| Variable | Required | Scope |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Web + migrations |
| `AUTH_SECRET` | Yes | Web |
| `AUTH_URL` | Yes | Web |
| `DISCORD_CLIENT_ID` | Yes | Web + bot |
| `DISCORD_CLIENT_SECRET` | Yes | Web |
| `DISCORD_BOT_TOKEN` | Yes | Bot |
| `DISCORD_GUILD_ID` | Prod | Bot command registration |
| `S3_*` | Optional | Team logos |

---

## 10. Roadmap gates

| Phase | Gate |
|-------|------|
| 1–6 + M1–M7 | Scaffold + live reads + full demo sim + shadcn + i18n + responsive + nav ✅ |
| **7a–7b** | Queue → match → ELO works end-to-end on web ✅ (live API); demo sim in M6 ✅ |
| **7c** | Bot commands use same queue/match APIs as web |
| **7d–7f** | Auth guards (middleware partial ✅), integration tests, security checklist (section 6) green |
| **7g–7k** | Live APIs for teams/tickets/admin/tournaments — demo UX done; wire to DB next |
| **8** | Production deploy only after 7a–7f green + monitoring configured |

See **README.md → Development phases** for the detailed step table and recommended order.

---

## 11. Quick reference links

- UI shell: `src/components/bscl/shell.tsx`
- Design primitives: `src/components/bscl/ui.tsx`
- Tokens / nav: `src/lib/constants.ts`
- ELO logic: `src/lib/elo.ts`
- Auth helpers: `src/lib/auth.ts`
- Schema: `prisma/schema.prisma`
- Bot entry: `bot/src/index.ts`

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
