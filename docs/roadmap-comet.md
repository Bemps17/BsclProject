# BSCL — Roadmap Comet · Démo → Production temps réel

> **Public :** toi + agent navigateur **Comet** (tâches manuelles dans les consoles web) + agent **Cursor** (code dans ce repo).  
> **Objectif :** passer du **mode démo** (localStorage, parcours simulé) au **mode Standard** (Discord OAuth, PostgreSQL, bot, temps réel) avec **Supabase** comme pivot DB + Realtime + Storage, en attendant **Cloudflare R2** pour le stockage objet à long terme.

**Références repo :** `README.md` · `AGENTS.md` · `docs/PLAYBOOK-AGENT.md` · `docs/security.md` · `docs/DESIGN.md`

---

## 1. Où en est le projet aujourd’hui

### Ce qui fonctionne déjà (code)

| Bloc | Statut | Fichiers clés |
|------|--------|----------------|
| UI shell mobile/desktop | ✅ | `src/components/bscl/shell.tsx` |
| Mode démo complet (queue → draft → ELO, teams, tickets…) | ✅ | `src/lib/local-store.ts`, `DemoProvider` |
| Mode live activé si `DATABASE_URL` + `AUTH_SECRET` | ✅ | `src/lib/backend.ts` |
| Matchmaker 10 joueurs + snake draft | ✅ | `src/lib/matchmaker.ts` |
| Pipeline résultat → confirm → ELO | ✅ | routes `/api/matches/[id]/*` |
| Bot Discord branché sur `/api/bot/*` | ✅ | `bot/src/index.ts`, `src/lib/bot-auth.ts` |
| Tests intégration PUG | ✅ | `src/lib/integration/pug-flow.integration.test.ts` |
| CSP, fetch-client erreurs visibles | ✅ | `src/lib/csp.ts`, `src/lib/fetch-client.ts` |

### Ce qui manque pour un produit « live » complet

| Bloc | Statut | Impact |
|------|--------|--------|
| **7d** Auth guards complets (rate limit, banned sur toutes mutations) | 🟡 Partiel | Risque sécurité |
| **7f** Durcissement prod (rate limits, audit log admin) | ❌ | Bloquant ouverture publique |
| **7g–7k** Teams / Tickets / Admin / Tournaments **API live** | ❌ UI démo seulement | Features non persistées |
| **Temps réel** (queue, match, draft) | ❌ Polling 3s sur `/play` | UX « FACEIT-like » incomplète |
| **Storage logos / screenshots** | ❌ Champ `Team.logoUrl`, S3 env vide | Upload impossible |
| **Pages publiques** `/status`, `/rules`, `/faq`, `/news` | ❌ | Contenu & confiance |
| **Phase 8** Deploy prod coordonné (Vercel + bot + domaine) | ❌ | Pas en ligne |

### Schéma mental : deux mondes

```mermaid
flowchart TB
  subgraph demo [Mode Démo]
    L1["/login → Demo"] --> C1["Cookie bscl_demo=1"]
    C1 --> LS["localStorage DemoProvider"]
    LS --> UI1["UI identique /play /teams…"]
  end

  subgraph live [Mode Standard — cible]
    L2["/login → Standard"] --> OAuth["Discord OAuth Auth.js"]
    OAuth --> PG["PostgreSQL Supabase"]
    PG --> API["Next.js /api/*"]
    API --> RT["Supabase Realtime"]
    RT --> UI2["UI /play sans polling"]
    BOT["Bot Discord Railway"] --> BAPI["/api/bot/*"]
    BAPI --> PG
    ST["Supabase Storage"] --> LOGOS["Logos équipes · screenshots"]
  end
```

---

## 2. Architecture cible (Supabase + Vercel + Railway)

| Composant | Rôle | Pourquoi Supabase maintenant |
|-----------|------|----------------------------|
| **Supabase Postgres** | Source de vérité (Prisma inchangé) | Via `DATABASE_URL` (PostgreSQL standard) |
| **Supabase Realtime** | Push sur `QueueEntry`, `Match`, `MatchPlayer` | Remplace le polling 3s de `play-client.tsx` |
| **Supabase Storage** | Buckets `team-logos`, `match-screenshots` | Rapide à mettre en place ; migration R2 plus tard |
| **Vercel** | Next.js web + API Routes | Déjà prévu dans README |
| **Railway / Render** | Bot Discord.js long-running | Vercel ≠ process persistant |
| **Cloudflare R2** (plus tard) | Stockage objet prod | S3-compatible ; `.env.example` déjà prévu |

**Important :** Prisma reste l’ORM. Supabase remplace **l’hébergeur Postgres**, pas Prisma. Realtime et Storage passent par `@supabase/supabase-js` en complément.

---

## 3. Vue d’ensemble des phases

| Phase | Nom | Qui | Durée indicative |
|-------|-----|-----|------------------|
| **0** | Prérequis & comptes | **Comet** (consoles) | 1 session |
| **1** | Supabase : projet + DB + Storage | **Comet** + **Cursor** (migrations) | 1–2 h |
| **2** | Discord : app OAuth + bot | **Comet** | 1 session |
| **3** | Env local live (sans démo forcée) | **Toi** + **Cursor** | 1 h |
| **4** | Bot hébergé + sync guild | **Comet** (Railway) + test | 1–2 h |
| **5** | Temps réel queue/match | **Cursor** | 1 PR |
| **6** | Upload logos & screenshots | **Cursor** + **Comet** (policies Storage) | 1 PR |
| **7** | Features live 7g→7k | **Cursor** (plusieurs PR) | Itératif |
| **8** | Durcissement 7d/7f + prod | **Cursor** + **Comet** (Vercel env) | 1–2 PR |
| **9** | Migration Storage → R2 | **Cursor** + **Comet** | Quand prêt |

---

## Phase 0 — Prérequis (Comet)

### Checklist comptes

- [ ] [Supabase](https://supabase.com/dashboard) — organisation + projet `bscl-prod` (et `bscl-dev` optionnel)
- [ ] [Discord Developer Portal](https://discord.com/developers/applications) — une app « BSCL » (OAuth + Bot)
- [ ] [Vercel](https://vercel.com) — repo GitHub connecté
- [ ] [Railway](https://railway.app) ou [Render](https://render.com) — pour le bot
- [ ] Domaine `bscl.gg` — DNS (Phase 8)
- [ ] Serveur Discord BSCL — droits admin pour inviter le bot

### Prompt Comet — inventaire comptes

```text
Tu es mon assistant pour finaliser BSCL (Black Squad Competitive League).

1. Ouvre un document notes (Notion/Google Doc) intitulé « BSCL Production Secrets ».
2. Pour chaque service ci-dessous, vérifie si j’ai déjà un compte connecté ; sinon guide-moi pour créer le compte :
   - Supabase (projet EU si possible)
   - Discord Developer Portal
   - Vercel (lié au repo GitHub BsclProject)
   - Railway ou Render pour un worker Node.js 24/7
3. Ne colle JAMAIS de secrets dans le chat public ; stocke-les uniquement dans le gestionnaire de mots de passe ou les champs env des plateformes.
4. À la fin, liste ce qui est ✅ prêt vs ❌ manquant.
```

---

## Phase 1 — Migrer la base vers Supabase

### 1.1 Ce que Comet fait dans Supabase Dashboard

1. **New project** → région proche des joueurs (EU West si FR/EU).
2. **Settings → Database** → copier :
   - `Connection string` **URI** (mode Session) → migrations Prisma locales
   - `Connection string` **Pooler** (Transaction, port 6543) → `DATABASE_URL` Vercel
3. **Settings → API** → noter `Project URL` + `anon key` + `service_role key` (Realtime + Storage côté serveur).
4. **Database → Extensions** → activer si besoin `uuid-ossp` (Prisma utilise cuid — rien de spécial).
5. **Storage** → créer buckets (Phase 6 détaillée ; tu peux les créer maintenant) :
   - `team-logos` (public read)
   - `match-screenshots` (private, signed URLs)

### 1.2 Ce que Cursor fait dans le repo

```bash
# Avec DATABASE_URL Supabase (direct, pas pooler) en local :
npm run db:push    # ou npm run db:migrate si migrations versionnées
npm run db:seed
npm test
```

Mettre à jour `.env.example` avec commentaires Supabase (optionnel, PR Cursor).

### Prompt Comet — création projet Supabase

```text
Contexte : app Next.js BSCL avec Prisma 7 et PostgreSQL. Je migre depuis Neon vers Supabase.

Dans supabase.com/dashboard :
1. Crée un projet nommé « bscl-prod » (région EU).
2. Va dans Project Settings → Database et montre-moi où copier :
   - URI directe (port 5432) pour les migrations Prisma en local
   - URI pooler Transaction (port 6543) pour la production serverless Vercel
3. Va dans Project Settings → API et indique où trouver SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
4. Dans Database → Replication (ou Publications Realtime selon l’UI actuelle), note quelles tables je devrai activer plus tard : QueueEntry, Match, MatchPlayer, Ticket.
5. Crée deux buckets Storage : « team-logos » (public) et « match-screenshots » (privé).
6. Résume les 5 valeurs à mettre dans mon .env local SANS les afficher en clair dans un canal public — utilise des champs masqués ou dis-moi de les coller moi-même dans .env.
```

### Variables `.env` après Phase 1

```env
# Postgres (pooler Supabase en prod)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase client (Phase 5–6)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."   # serveur uniquement, jamais NEXT_PUBLIC
```

---

## Phase 2 — Discord OAuth + Bot (Comet)

Une **seule** application Discord sert OAuth web **et** bot (même `DISCORD_CLIENT_ID`).

### 2.1 OAuth2 (mode Standard / login web)

| Paramètre | Valeur |
|-----------|--------|
| Redirect URI local | `http://localhost:3000/api/auth/callback/discord` |
| Redirect URI prod | `https://bscl.gg/api/auth/callback/discord` |
| Scopes | `identify`, `email` (minimum) |

### 2.2 Bot

| Paramètre | Valeur |
|-----------|--------|
| Intents | `Guilds` (minimum ; ajouter si présence/message plus tard) |
| Token | → `DISCORD_BOT_TOKEN` (bot **et** Bearer `/api/bot/*` par défaut) |
| Invite URL | scopes `bot` + `applications.commands` |
| Guild test | `DISCORD_GUILD_ID` → enregistrement slash commands instantané |

### 2.3 Lien compte Discord ↔ BSCL

Le bot exige un compte lié (`User.discordId` créé via OAuth web). **Ordre onboarding joueur :**

1. Se connecter sur **bscl.gg/login → Standard** (OAuth).
2. Ensuite seulement `/join` sur Discord fonctionne.

### Prompt Comet — configuration Discord Developer Portal

```text
Je configure BSCL sur Discord Developer Portal pour OAuth + bot matchmaking.

Application : BSCL (ou crée-la).

Étapes à exécuter avec moi :
1. Onglet OAuth2 → ajouter Redirect URLs :
   - http://localhost:3000/api/auth/callback/discord
   - https://bscl.gg/api/auth/callback/discord
2. OAuth2 → copier Client ID et Client Secret (je les mets dans DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET).
3. Onglet Bot → Reset Token → je stocke DISCORD_BOT_TOKEN (ne jamais committer).
4. Bot → activer les intents nécessaires (Server Members Intent seulement si on en a besoin plus tard).
5. Générer URL d’invitation bot avec permissions : Send Messages, Use Slash Commands, Embed Links (minimum).
6. Inviter le bot sur mon serveur Discord BSCL test.
7. Copier l’ID du serveur (clic droit → Copier l’identifiant) → DISCORD_GUILD_ID.

Vérifie que Client ID bot = Client ID OAuth (même application).
```

### Prompt Comet — tester OAuth local

```text
Aide-moi à tester le login Standard BSCL en local :

1. Vérifie que mon .env local contient DATABASE_URL, AUTH_SECRET, AUTH_URL=http://localhost:3000, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET.
2. Lance ou confirme que `npm run dev` tourne sur le port 3000.
3. Ouvre http://localhost:3000/login → choisis « Standard » / Discord.
4. Après redirect, confirme que j’atterris sur / (home) et pas en mode démo (pas de cookie bscl_demo=1).
5. Si erreur OAuth, capture l’URL d’erreur et compare Redirect URI Discord vs AUTH_URL.
```

---

## Phase 3 — Basculer du démo au live en local

### Comportement actuel (`src/lib/backend.ts`)

| Condition | Résultat |
|-----------|----------|
| `DATABASE_URL` + `AUTH_SECRET` définis | Backend live possible |
| Cookie `bscl_demo=1` | Mode démo même si DB configurée |
| `BSCL_DEMO=1` | Force démo partout |

### Étapes manuelles

1. Remplir `.env` complet (Phase 1 + 2).
2. `npm run db:seed` — saison + données de service.
3. **Ne pas** cliquer « Demo » sur `/login` ; choisir **Standard**.
4. Vérifier `/api/status` → DB online.
5. `/play` → join queue ; second compte Discord (ou bot test) pour atteindre 10 joueurs.

### Prompt Cursor — vérifier le parcours live

```text
Lis AGENTS.md §3.2 et teste le parcours PUG live :
- Login Standard (session Auth.js)
- POST /api/queue join + leave
- Simuler 10 joueurs ou documenter comment seed la queue
- Vérifier création Match DRAFT → LIVE
- submit result + confirm → ELO updated

Liste les gaps restants vs mode démo (UI draft live, redirections, etc.).
```

### Prompt Comet — check-list « je suis en live ou en démo ? »

```text
Sur mon déploiement BSCL (local ou Vercel preview) :

1. Ouvre DevTools → Application → Cookies : bscl_demo présent ?
2. Ouvre /api/status et note database + auth.
3. Sur /play, rejoins la file : l’appel POST /api/queue renvoie 401 sans login ?
4. Documente : suis-je en mode démo (localStorage) ou live (network calls Prisma) ?
```

---

## Phase 4 — Héberger le bot Discord (Comet + toi)

Le bot est dans `bot/` — process **long-running**, pas Vercel.

### Variables Railway / Render

```env
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
BSCL_API_URL=https://bscl.gg
BOT_API_SECRET=          # optionnel ; sinon token bot par défaut
```

### Prompt Comet — deploy bot sur Railway

```text
Je déploie le bot BSCL Matchmaker (Node.js, dossier bot/ du repo BsclProject) sur Railway.

1. New Project → Deploy from GitHub → repo BsclProject.
2. Root directory / start command : indique `cd bot && npm install && npm run start` (ou le script package.json du bot).
3. Ajoute les variables d’environnement : DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, BSCL_API_URL=https://[mon-url-vercel].
4. Déploie et montre-moi les logs au démarrage : « Registered guild commands » attendu.
5. Sur Discord, teste /queue, /join (avec un compte déjà OAuth sur le site).
6. Si ACCOUNT_NOT_LINKED : rappelle-moi de me connecter d’abord sur le site Standard.
```

### Prompt Comet — enregistrer les slash commands

```text
Le bot BSCL enregistre les commandes via Discord REST au boot (bot/src/index.ts).

Vérifie :
1. DISCORD_GUILD_ID correspond au serveur où le bot est invité.
2. Le bot a la permission applications.commands.
3. Les commandes /join /leave /queue /result /confirm /dispute apparaissent sous 1 minute.
4. Si commandes globales lentes : confirme qu’on utilise bien guild commands (guildId set).
```

---

## Phase 5 — Temps réel avec Supabase Realtime

### Problème actuel

`play-client.tsx` poll `/api/queue` toutes les **3 secondes** en mode live. Latence + charge inutile.

### Stratégie recommandée

```mermaid
sequenceDiagram
  participant UI as PlayClient
  participant API as Next.js API
  participant DB as Supabase Postgres
  participant RT as Supabase Realtime

  UI->>API: POST /api/queue (join)
  API->>DB: INSERT QueueEntry
  DB-->>RT: postgres_changes
  RT-->>UI: payload joueurs
  UI->>UI: update slots sans polling
```

### Tables à publier en Realtime

| Table | Événements UI |
|-------|----------------|
| `QueueEntry` | Slots file d’attente, compteur |
| `Match` | Nouveau match, changement statut |
| `MatchPlayer` | Draft picks, équipes |

### Implémentation (PR Cursor — pas Comet)

1. `npm install @supabase/supabase-js`
2. `src/lib/supabase/client.ts` (browser, anon key)
3. `src/lib/supabase/server.ts` (service role — uploads admin seulement)
4. Hook `useQueueRealtime()` remplace `setInterval` dans `play-client.tsx`
5. Filtrer RLS : Realtime respecte Row Level Security → policies à définir

### Prompt Cursor — PR Realtime

```text
Objectif : remplacer le polling 3s de src/app/(platform)/play/play-client.tsx par Supabase Realtime.

Contraintes AGENTS.md :
- Minimiser le diff ; garder fetch initial /api/queue
- Mode démo inchangé (DemoProvider)
- Pas de secret service_role côté client
- TypeScript strict, tests si hook extrait

Livrables :
1. Client Supabase browser (NEXT_PUBLIC_*)
2. Subscription postgres_changes sur QueueEntry (status=WAITING) et Match pour le joueur courant
3. Fallback polling 30s si Realtime déconnecté
4. Documenter dans docs/roadmap-comet.md annexe les policies RLS SQL à appliquer dans Supabase
```

### Prompt Comet — activer Realtime + RLS dans Supabase

```text
Dans Supabase Dashboard pour le projet bscl-prod :

1. Database → Publications : active Realtime pour les tables QueueEntry, Match, MatchPlayer (noms Prisma avec casse exacte — vérifie dans schema.prisma).
2. Authentication → Policies : aide-moi à créer des policies RLS :
   - QueueEntry : SELECT pour authenticated (Auth.js n’utilise pas Supabase Auth nativement — note si on doit utiliser service role + channel privé ou migrer vers custom JWT Supabase).
3. Si RLS incompatible avec Auth.js session actuelle : propose canal Realtime « broadcast » depuis API route après mutation (pattern fallback) et documente le choix.

Explique clairement la recommandation la plus simple pour BSCL qui garde Auth.js Discord.
```

> **Note architecture :** Auth.js **≠** Supabase Auth. Deux patterns :
> - **A (simple)** : Realtime via **Broadcast** déclenché par API route après join/leave (pas de RLS Supabase Auth).
> - **B (avancé)** : JWT custom Supabase avec claim `playerId` — plus de travail.
> 
> Pour la finalisation rapide, privilégier **A** puis migrer vers **B** si besoin.

---

## Phase 6 — Storage logos & screenshots (Supabase → R2 plus tard)

### Modèle existant

`Team.logoUrl` (String?) dans `prisma/schema.prisma` — aujourd’hui GET `/api/teams` renvoie l’URL ; **pas d’upload**.

### Buckets Supabase

| Bucket | Visibilité | Usage |
|--------|------------|-------|
| `team-logos` | Public | `{teamId}/logo.webp` max 512 KB |
| `match-screenshots` | Private | `{matchId}/{uuid}.png` preuves dispute |

### Flux upload (à coder — Cursor)

1. `POST /api/teams/[id]/logo` — `requireAuth` capitaine
2. Serveur : validate mime (webp/png), resize, `supabase.storage.from('team-logos').upload`
3. Update `Team.logoUrl` avec public URL
4. CSP : ajouter domaine Supabase dans `img-src` (`src/lib/csp.ts`)

### Prompt Comet — policies Storage

```text
Supabase Storage — buckets team-logos et match-screenshots :

1. team-logos : policy lecture publique, écriture réservée au service role (upload via API Next.js uniquement).
2. match-screenshots : lecture via signed URL ; écriture via API authentifiée capitaine/modérateur.
3. Limite taille 2 Mo, types image/png, image/webp, image/jpeg.
4. Donne-moi les policies SQL/JSON exactes à coller dans le dashboard.
```

### Migration future Cloudflare R2

Quand R2 est prêt :

1. Copier objets Supabase → R2 (`rclone` ou script one-shot)
2. Remplacer URLs en base (`logoUrl`)
3. Basculer `S3_*` dans `.env.example` (déjà prévu)
4. Adapter upload handler pour `@aws-sdk/client-s3` endpoint R2

### Prompt Cursor — abstraction storage

```text
Crée src/lib/storage.ts avec interface uploadTeamLogo(buffer) → url.
Implémentation 1 : Supabase Storage (env SUPABASE_SERVICE_ROLE_KEY).
Implémentation 2 : stub S3/R2 commentée pour plus tard.
Route POST /api/teams/[id]/logo avec validation Zod + auth capitaine.
Mets à jour CSP img-src pour *.supabase.co.
```

---

## Phase 7 — Features live (7g → 7k)

Prioriser dans cet ordre (demo UX déjà validée en M6) :

| Step | Feature | API à créer | UI existante |
|------|---------|-------------|--------------|
| **7g** | Teams CRUD + invitations | `POST/PATCH /api/teams`, invites | `teams-client.tsx` |
| **7h** | Tickets + dispute link | `POST /api/tickets`, staff PATCH | `tickets-client.tsx` |
| **7i** | Admin CRUD + audit | `/api/admin/*` + `AuditLog` | `admin-client.tsx` |
| **7j** | Tournaments register/check-in | `/api/tournaments/*` | `tournaments-client.tsx` |
| **7k** | Pages `/status`, `/rules`, `/faq`, `/news` | CMS simple ou MDX | À créer |

### Prompt Cursor générique (par feature)

```text
Tâche : brancher [FEATURE] en mode live en réutilisant l’UX démo M6.

Lis AGENTS.md §3.[journey] et le client *-client.tsx / *-demo.tsx existant.
- API routes avec requireAuth / hasRole
- Validators Zod dans src/lib/validators/
- Tests API 401/403/409 + happy path
- Mode démo inchangé (DemoProvider)
- i18n EN + FR pour nouveaux strings

Ne pas dupliquer la logique métier démo dans les pages — extraire services partagés si nécessaire.
```

### Prompt Comet — validation manuelle feature

```text
Test manuel BSCL [FEATURE] en mode Standard sur https://[preview].vercel.app :

1. Login Discord compte A et compte B (navigation privée).
2. [Étapes spécifiques feature — ex. créer équipe, inviter, accepter]
3. Vérifie persistance : refresh page, données toujours là.
4. Capture écran + note bugs UX.
```

---

## Phase 8 — Durcissement & production (7d, 7f, 8a–8d)

### 7d — Auth guards (Cursor)

- Middleware : routes mutantes `/api/*` → session ou 401
- `requireAuth()` sur POST teams, tickets, admin
- Utilisateur `banned: true` → 403 partout

### 7f — Sécurité (Cursor + PLAYBOOK S*)

- Rate limit `/api/queue`, `/api/auth`, `/api/tickets` (Upstash Redis ou middleware Vercel)
- Erreurs prod sans stack trace
- `AuditLog` sur actions admin

### 8a–8d — Deploy (Comet)

### Prompt Comet — Vercel production env

```text
Configure les variables d’environnement Vercel pour bscl-prod (Production + Preview) :

DATABASE_URL = [Supabase pooler transaction]
AUTH_SECRET = [openssl rand base64 32]
AUTH_URL = https://bscl.gg
DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (Production only, pas Preview si possible)

Vérifie :
- Pas de BSCL_DEMO=1 en production
- Domaine bscl.gg → projet Vercel
- Discord Redirect URI prod ajoutée
- Deploy → /api/status OK
```

### Prompt Comet — go-live checklist

```text
Checklist go-live BSCL :

1. /api/status → database online
2. Login Standard Discord prod
3. /play join queue (2 comptes minimum)
4. Bot /join sur Discord après OAuth web
5. Pas de cookie bscl_demo en prod
6. CSP ne bloque pas Discord avatars ni Supabase images
7. Lighthouse accessibilité ≥ 90 sur /login mobile 390px
```

---

## 9. Matrice « qui fait quoi »

| Tâche | Comet (navigateur) | Cursor (code) | Toi |
|-------|-------------------|---------------|-----|
| Créer projet Supabase | ✅ | | Valider région / plan |
| Migrations Prisma | | ✅ | Coller DATABASE_URL local |
| Discord OAuth + bot token | ✅ | | Stocker secrets |
| Deploy bot Railway | ✅ | | Payer / surveiller logs |
| Realtime Supabase | ✅ policies dashboard | ✅ hook + UI | Tester 2 navigateurs |
| Upload logos | ✅ bucket policies | ✅ API route | Tester upload |
| Teams/Tickets API | | ✅ | Test manuel 2 comptes |
| Rate limits / audit | | ✅ | |
| Vercel prod env | ✅ | | DNS domaine |
| Merger PR | | ✅ (agent) | Review |

---

## 10. Definition of Done — « BSCL live complet »

Tu peux considérer la finalisation atteinte quand :

- [ ] **Plus de démo forcée** en prod ; démo reste opt-in sur `/login` pour marketing
- [ ] **OAuth Discord** crée `User` + `Player` ; bot `/join` fonctionne après login web
- [ ] **Queue 10 joueurs** crée un match ; draft visible en UI live (pas seulement démo)
- [ ] **Confirm match** met à jour ELO transactionnel + `EloHistory`
- [ ] **Realtime** : file d’attente mise à jour sans polling agressif (< 1s perceived)
- [ ] **Teams** : création + logo upload Supabase + URL en DB
- [ ] **Tickets** : dispute match → ticket staff
- [ ] **Admin** : sanctions + audit log
- [ ] **7f** : rate limits + checklist `docs/security.md` verte
- [ ] **Monitoring** : `/api/status` + alertes si DB offline
- [ ] Plan documenté **migration R2** quand le trafic storage le justifie

---

## 11. Prompts Comet « session complète » (copier-coller)

### Session A — Infra jour 1 (2–3 h)

```text
Session BSCL Infra — exécute dans l’ordre, une étape à la fois, attends ma confirmation entre chaque :

1. Supabase bscl-prod + buckets + copier env DB/API
2. Discord app OAuth redirects + bot token + invite bot + GUILD_ID
3. Vercel : lier repo, coller env preview, premier deploy
4. Railway : deploy bot/, variables, logs commandes enregistrées
5. Test E2E : login Standard → /play join → Discord /queue cohérent

Ne commite aucun secret. À la fin produis un tableau « variable → où elle vit → ✅/❌ ».
```

### Session B — Realtime + Storage (après PR Cursor)

```text
Session BSCL Realtime/Storage :

1. Supabase Realtime : activer tables queue/match
2. Vérifier que deux onglets /play voient la file se mettre à jour sans refresh manuel
3. Upload test logo équipe via UI ; URL affichée sur /teams
4. Vérifier Network : pas de polling /api/queue toutes les 3s (ou fallback 30s seulement)
5. Si CSP bloque images Supabase, note l’erreur console exacte pour PR CSP.
```

### Session C — Go-live

```text
Session BSCL Go-live bscl.gg :

1. DNS → Vercel
2. Env production final
3. Discord redirect prod
4. Smoke test parcours joueur complet (login → queue → match → confirm)
5. Désactiver BSCL_DEMO partout
6. Post-mortem : liste bugs P0/P1
```

---

## 12. Annexe — Policies RLS / Realtime (brouillon SQL)

> À adapter après inspection des noms de tables Prisma (`"QueueEntry"`, `"Match"`, etc.).

```sql
-- Realtime : Supabase dashboard → Database → Publications
-- Ajouter les tables à supabase_realtime

-- Exemple policy Storage team-logos (lecture publique)
-- Via Dashboard Storage → Policies

-- Si Auth.js sans Supabase Auth : préférer uploads via service role
-- et Realtime Broadcast depuis API plutôt que RLS utilisateur fin.
```

---

## 13. Liens rapides repo

| Sujet | Fichier |
|-------|---------|
| Activer backend live | `src/lib/backend.ts` |
| Cookie démo | `bscl_demo` · `src/middleware.ts` |
| Queue service | `src/lib/queue-service.ts` |
| Bot API auth | `src/lib/bot-auth.ts` · `docs/security.md` |
| Polling actuel | `src/app/(platform)/play/play-client.tsx` L119–127 |
| Schema DB | `prisma/schema.prisma` |
| Env template | `.env.example` |
| Tests gate | `npm run verify` |

---

*Dernière mise à jour : aligné sur `main` post PR #14 (a11y + Sora/Montserrat). Mettre à jour ce doc quand 7g–7f ou Supabase sont branchés.*
