# BSCL — Black Squad Competitive League

Competitive platform for Black Squad: Discord auth, 5v5 PUGs, ELO rankings, teams, tournaments, and admin tools.

**Domain:** [bscl.gg](https://bscl.gg)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM, PostgreSQL (Neon) |
| Auth | Discord OAuth (Auth.js / NextAuth v5) · guest demo mode |
| i18n | EN / FR client-side (`src/lib/i18n/`) |
| Bot | Discord.js (`bot/`) — BSCL Matchmaker |
| Hosting | Vercel (web) · Railway (bot + DB) |

## Quick start

```bash
cp .env.example .env
# Fill DATABASE_URL, AUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET

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

- [x] **M1 — Live data** — Neon PostgreSQL, Prisma read layer, pages wired to DB (`src/lib/data.ts`)
- [x] **M2 — Demo mode** — Guest login + local queue via `localStorage` when `DATABASE_URL` / `AUTH_SECRET` are missing (`src/lib/backend.ts`, `src/lib/local-store.ts`)
- [x] **M3 — i18n** — English + French, ENG/FR switcher in header (`src/lib/i18n/`, `LocaleProvider`)
- [x] **M4 — Responsive** — Compact mobile header, full-height desktop sidebar, adaptive content width, table scroll on small screens

### Core loop — next (Phase 7)

The schema and UI exist; **orchestration** is the main gap.

| Step | Scope | Status |
|------|--------|--------|
| **7a** | **Matchmaker** — pop queue at 10 players, snake draft, create `Match` + `MatchPlayer` rows | Done |
| **7b** | **Results pipeline** — submit → confirm → `EloHistory` + player ELO update (transactional) | Done |
| **7c** | **Bot sync** — replace in-memory bot queue; wire `/result`, `/confirm`, `/dispute` to API/DB | Not started |
| **7d** | **Auth guards** — middleware, `/admin` role check, banned users on mutating routes | Partial (`/admin` server guard) |
| **7e** | **Integration tests** — OAuth → queue → match → ELO; confirm idempotency | Not started |
| **7f** | **Security review** — rate limits, error sanitization, audit log on admin actions | Not started |

### Features — after core loop

| Step | Scope | Status |
|------|--------|--------|
| **7g** | **Teams** — create / invite / manage (API + UI) | UI read-only |
| **7h** | **Tickets** — create, staff workflow, link to `DISPUTED` matches | Static demo list |
| **7i** | **Admin CRUD** — users, sanctions, pending matches, news, seasons | Cards only |
| **7j** | **Tournaments** — registration, check-in, brackets | Static demo list |
| **7k** | **Public pages** — `/status`, `/rules`, `/faq`, `/news` | Not built |

### Production — Phase 8

- [ ] **Phase 8a** — Vercel prod env (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, Discord OAuth redirects)
- [ ] **Phase 8b** — Bot hosted (Railway or similar) + shared DB with web app
- [ ] **Phase 8c** — Monitoring, `ServiceHealth` updates, error tracking
- [ ] **Phase 8d** — Domain `bscl.gg` + SSL + load test on `/api/queue`

### Recommended order

1. **7a → 7b** — End-to-end PUG match (highest product value)
2. **7c** — Discord bot parity with web queue/match flow
3. **7d → 7e → 7f** — Harden before opening to real players
4. **7g → 7h → 7i** — Staff & community features
5. **7j → 7k** — Tournaments & content pages
6. **Phase 8** — Production deploy once 7a–7f are green

## Demo vs live mode

| Mode | Trigger | Auth | Data |
|------|---------|------|------|
| **Demo** | Missing `DATABASE_URL` or `AUTH_SECRET` | Guest profile in browser | Empty server data + local queue |
| **Live** | Both env vars set | Discord OAuth | PostgreSQL via Prisma |

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
npm test              # 55 unit/integration tests
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
