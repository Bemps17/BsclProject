# BSCL — Security & operations

> Complément de `AGENTS.md` §6. Les agents chargent ce fichier pour les tâches **S1–S7**.

## Modèle d'accès

| Surface | Live | Démo |
|---------|------|------|
| Pages `(platform)/` | Session Discord (Auth.js) | Cookie `bscl_demo=1` |
| `/login` | Public | Public |
| `/api/*` | Handlers + `requireAuth()` | Routes publiques ou session selon handler |
| `/admin` | Rôle `MODERATOR+` | Preview local uniquement |

Middleware : `src/middleware.ts` — redirige vers `/login` si ni session ni cookie démo.

## Secrets (jamais en repo)

| Variable | Scope |
|----------|--------|
| `AUTH_SECRET` | Web |
| `DATABASE_URL` | Web + migrations |
| `DISCORD_CLIENT_SECRET` | Web |
| `DISCORD_BOT_TOKEN` | Bot |

Documenter toute nouvelle variable dans `.env.example`.

## Vérification post-config (exemple)

Remplacer les placeholders ; ne pas committer de valeurs réelles.

```bash
# Health (sans auth)
curl -sS "https://bscl.gg/api/status" | jq .

# Queue sans session → doit retourner 401
curl -sS -o /dev/null -w "%{http_code}\n" -X POST "https://bscl.gg/api/queue"
```

## Health / migrations (S3)

- **Development** : bootstrap schéma autorisé si documenté dans le handler status.
- **Production** : pas de DDL automatique sur un GET health normal ; utiliser `npm run db:migrate` / `prisma migrate deploy` en CI/CD.

## Postgres moindre privilège (S6)

Voir `scripts/neon-roles.sql` (optionnel) pour un rôle applicatif limité aux tables nécessaires. Brancher `DATABASE_URL` sur ce rôle en production.

## CSP (S4)

Applied on HTML responses via `src/middleware.ts` (`buildContentSecurityPolicy()` in `src/lib/csp.ts`).

| Directive | Value |
|-----------|--------|
| `script-src` | `'self' 'unsafe-inline'` — **no `unsafe-eval`** |
| `style-src` | `'self' 'unsafe-inline'` |
| `img-src` | `'self' data: blob: https://cdn.discordapp.com` |
| `connect-src` | `'self' https://discord.com https://discordapp.com` |
| `form-action` | `'self' https://discord.com` (OAuth) |

## Bot API (7c)

Discord bot calls `/api/bot/*` with:

```bash
Authorization: Bearer <DISCORD_BOT_TOKEN or BOT_API_SECRET>
X-Discord-User-Id: <discord snowflake>
```

Linked BSCL account required (`User.discordId` from Discord OAuth on web).

```bash
# Queue status (bot auth)
curl -sS "http://localhost:3000/api/bot/queue" \
  -H "Authorization: Bearer $DISCORD_BOT_TOKEN" \
  -H "X-Discord-User-Id: 123456789012345678"
```

## Checklist PR

Reprendre la liste §6 de `AGENTS.md` applicable à la diff + tests auth/API touchés.
