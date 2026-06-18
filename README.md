# BSCL — Black Squad Competitive League

Competitive platform for Black Squad: Discord auth, 5v5 PUGs, ELO rankings, teams, tournaments, and admin tools.

**Domain:** [bscl.gg](https://bscl.gg)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM, PostgreSQL (Supabase) |
| Auth | Discord OAuth (Auth.js / NextAuth v5) · guest demo mode |
| i18n | EN / FR client-side (`src/lib/i18n/`) |
| Bot | Discord.js (`bot/`) — BSCL Matchmaker |
| Hosting | Vercel (web) · Railway (bot + DB) |

## Quick start

```bash
cp .env.example .env
# Fill DATABASE_URL (Supabase Postgres), AUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET

npm install
npm run db:push
npm run db:seed
npm run dev
npm test
```

Open [http://localhost:3000](http://localhost:3000).

### Discord bot

```bash
cd bot && npm install
# Set DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID in bot/.env
npm run dev
```

## Project structure

```
AGENTS.md             # Agent guide: design system, journeys, security & test gates
docs/
  PLAYBOOK-AGENT.md   # Unified playbook (quality, design, security tasks Q/D/S)
  DESIGN.md           # Design tokens & or/blue rules
  security.md         # Ops security checklist
src/
  app/
    (platform)/     # Main app (Home, Play, Rankings, Teams, Profile…)
    api/              # REST API (leaderboard, queue, matches, teams, status)
    login/            # Discord sign-in
  components/bscl/   # UI shell, demo provider, i18n, shared components
  lib/                # Prisma, ELO, auth, data, i18n, backend flag
prisma/schema.prisma  # Full data model
bot/                  # BSCL Matchmaker Discord bot
```

## Development phases (roadmap)

### Foundation — done

- [x] **Phase 1** — Next.js, Prisma, Tailwind, Discord OAuth scaffold
- [x] **Phase 2** — Database schema, seed script (Season 1 + service health)
- [x] **Phase 3** — Core API routes, ELO logic, permissions helpers
- [x] **Phase 4** — Mobile-first frontend shell (Dark Esports theme)
- [x] **Phase 5** — Discord bot scaffold + slash commands
- [x] **Phase 6** — Admin dashboard UI scaffold

### Milestones — done

- [x] **M1 — Live data** — PostgreSQL (Prisma), read layer, pages wired to DB (`src/lib/data.ts`)
- [x] **M2 — Demo mode** — Explicit choice (Demo vs Standard), cookie `bscl_demo`, localStorage journey (`src/lib/backend.ts`, `src/lib/local-store.ts`, `src/middleware.ts`)
- [x] **M3 — i18n** — English + French, ENG/FR switcher in header (`src/lib/i18n/`, `LocaleProvider`)
- [x] **M4 — Responsive** — `dvh`/safe-area login, mobile tab bar, adaptive content width, scrollable tables
- [x] **M5 — Design system** — shadcn/ui (`base-nova`), semantic tokens, BSCL layer on `src/components/ui/`
- [x] **M6 — Demo platform sim** — Full local prototype: queue → draft → match → ELO, teams, tournaments, tickets, disputes, admin preview (`DemoProvider`, page wrappers)
- [x] **M7 — Navigation** — `ButtonLink` for internal routes; demo sign-in routes to `/demo` hub (not `/login`)

### Core loop — next (Phase 7)

The schema and UI exist; **orchestration** is the main gap.

| Step | Scope | Status |
|------|--------|--------|
| **7a** | **Matchmaker** — pop queue at 10 players, snake draft, create `Match` + `MatchPlayer` rows | Done |
| **7b** | **Results pipeline** — submit → confirm → `EloHistory` + player ELO update (transactional) | Done |
| **7c** | **Bot sync** — `/api/bot/*` + Discord bot wired to shared queue/match APIs | Done |
| **7d** | **Auth guards** — middleware platform gate, `/admin` role check, banned users on mutating routes | Partial (middleware + `/admin` server guard) |
| **7e** | **Integration tests** — queue → match → confirm idempotency (`src/lib/integration/pug-flow.integration.test.ts`) | Done |
| **7f** | **Security review** — rate limits, error sanitization, audit log on admin actions | Not started |

### Features — after core loop

| Step | Scope | Live status | Demo sim |
|------|--------|-------------|----------|
| **7g** | **Teams** — create / invite / manage (API + UI) | UI read-only | Interactive (local) |
| **7h** | **Tickets** — create, staff workflow, link to `DISPUTED` matches | Static list | Interactive (local) |
| **7i** | **Admin CRUD** — users, sanctions, pending matches, news, seasons | Cards only | Preview + local stats |
| **7j** | **Tournaments** — registration, check-in, brackets | Static list | Register (local) |
| **7k** | **Public pages** — `/status`, `/rules`, `/faq`, `/news` | Not built | Not built |

### Production — Phase 8

- [ ] **Phase 8a** — Vercel prod env (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, Discord OAuth redirects)
- [ ] **Phase 8b** — Bot hosted (Railway or similar) + shared DB with web app
- [ ] **Phase 8c** — Monitoring, `ServiceHealth` updates, error tracking
- [ ] **Phase 8d** — Domain `bscl.gg` + SSL + load test on `/api/queue`

### Recommended order

1. ~~**7a → 7b**~~ — End-to-end PUG match on web ✅
2. **7c** — Discord bot parity with web queue/match flow
3. **7d → 7e → 7f** — Harden before opening to real players
4. **7g → 7h → 7i** — Wire live APIs (demo UX already validated in M6)
5. **7j → 7k** — Tournaments & content pages
6. **Phase 8** — Production deploy once 7a–7f are green

## Demo vs live mode

| Mode | Trigger | Auth | Data |
|------|---------|------|------|
| **Demo** | User chooses « Demo » on `/login` → cookie `bscl_demo=1` (or `BSCL_DEMO=1`) | Guest or simulated Discord in browser | `localStorage` — full platform sim (queue, draft, ELO, teams, tickets…) |
| **Live** | User chooses « Standard » → Discord OAuth session | Discord OAuth | PostgreSQL via Prisma |

Unauthenticated visitors are redirected to `/login` until they pick a mode or sign in (`src/middleware.ts`).

See `src/lib/backend.ts` and `.env.example` for required variables.

## ELO system

- Starting ELO: **1000**
- Placement matches: **5** (protection enabled)
- Ranks: Bronze → Silver → Gold → Platinum → Diamond → Elite (1800+)
- Season end: soft reset

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaderboard` | Top 100 players |
| GET/POST/DELETE | `/api/queue` | PUG queue status / join / leave |
| GET | `/api/teams` | Team list |
| GET | `/api/matches` | Match history |
| POST | `/api/matches/[id]/result` | Captain submits score (LIVE → SUBMITTED) |
| POST | `/api/matches/[id]/confirm` | Opposing captain confirms (SUBMITTED → CONFIRMED + ELO) |
| POST | `/api/matches/[id]/dispute` | Captain disputes result → ticket |
| GET | `/api/status` | Service health |

## User roles

`PLAYER` → `CAPTAIN` → `MODERATOR` → `ADMIN` → `OWNER`

## Tests

```bash
npm test              # 67 unit/integration tests
npm run test:coverage # coverage report (v8)
```

| Area | File |
|------|------|
| ELO & ranks | `src/lib/elo.test.ts` |
| Match / draft / queue | `src/lib/match.test.ts` |
| Auth & roles | `src/lib/auth.test.ts` |
| Validators | `src/lib/validators/*.test.ts` |
| Queue API | `src/app/api/queue/route.test.ts` |
| Bot queue parity | `bot/src/lib/queue.test.ts` |

## License

Private — BSCL project.
