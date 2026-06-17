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

Si une CSP est ajoutée dans `middleware.ts`, documenter ici toute directive requise (`unsafe-eval`, domaines Discord, Vercel).

## Checklist PR

Reprendre la liste §6 de `AGENTS.md` applicable à la diff + tests auth/API touchés.
