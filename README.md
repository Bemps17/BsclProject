# BSCL — Black Squad Competitive League

Competitive platform for Black Squad: Discord auth, 5v5 PUGs, ELO rankings, teams, tournaments, and admin tools.

**Domain:** [bscl.gg](https://bscl.gg)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM, PostgreSQL |
| Auth | Discord OAuth (Auth.js / NextAuth v5) |
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
  components/bscl/   # UI shell + shared components
  lib/                # Prisma, ELO, auth helpers
prisma/schema.prisma  # Full data model
bot/                  # BSCL Matchmaker Discord bot
```

## Development phases (roadmap)

- [x] **Phase 1** — Next.js, Prisma, Tailwind, Discord OAuth scaffold
- [x] **Phase 2** — Database schema, seed script
- [x] **Phase 3** — Core API routes, ELO logic, permissions
- [x] **Phase 4** — Frontend (mobile-first shell from design mockup)
- [x] **Phase 5** — Discord bot scaffold with slash commands
- [x] **Phase 6** — Admin dashboard UI scaffold
- [ ] **Phase 7** — Integration tests, ELO validation, security review
- [ ] **Phase 8** — Production deploy (bscl.gg), monitoring

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
| GET | `/api/status` | Service health |

## User roles

`PLAYER` → `CAPTAIN` → `MODERATOR` → `ADMIN` → `OWNER`

## License

Private — BSCL project.
