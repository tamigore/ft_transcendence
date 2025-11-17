# Transcendance

Multiplayer Pong game and social network project — 42 project.

This repository contains a full-stack realtime game and chat application built as a project for 42. It includes:

- A NestJS backend (REST + WebSocket gateways) with authentication (local, OAuth 42), JWTs, refresh tokens and optional 2FA.
- A Vue 3 frontend providing a lobby, chat rooms, matchmaking and a Pong game (spectators supported).
- Prisma ORM with a PostgreSQL database.
- Docker Compose for local development (Postgres, pgAdmin, backend, frontend).

This README explains how the project is structured, required environment variables, and how to run the system locally (Docker and non-Docker workflows).

**Quick facts**

- Backend: NestJS (TypeScript) — HTTP API on port `3000` with global prefix `/api`.
- WebSockets: Game gateway `8081` and Chat gateway `8082`.
- Frontend: Vue 3 (dev server on `8080`).
- Database: PostgreSQL (default container binds `5432`) and `pgAdmin` on `5555`.
- ORM: Prisma (schema in `backend/prisma/schema.prisma`).

**Table of contents**

- **Getting Started**
- **Run Using Docker**
- **Database / Prisma**
- **Environment variables**
- **Architecture & Important files**
- **Testing**
- **Makefile shortcuts**
- **License**

---

**Getting Started**

- Docker & Docker Compose (or docker CLI supporting `docker compose`).
- Node.js (v18+ recommended) and `npm` if you run services without Docker.
- A PostgreSQL-compatible client (optional) or `pgAdmin` (available in `docker-compose`).

---

**Run Using Docker**

1. Create a `.env` file at repository root or set environment variables (see "Environment variables" below).
2. From project root run (Makefile wraps docker compose):

```bash
# Builds and runs all services (backend, frontend, postgres, pgadmin)
make all
# OR directly
docker compose up --build
```

3. After containers are healthy:

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api
- pgAdmin: http://localhost:5555

Note: The backend depends on the DB service health; docker-compose uses a healthcheck for Postgres.
> **Postgres 18+ data note**: the official Postgres images now expect the volume to be mounted at `/var/lib/postgresql` (not `/var/lib/postgresql/data`). If you launched the stack before this change, remove the previous volume before running `make all` again:

> ```bash
> docker compose down
> docker volume rm ft_transcendence_postgres-data  # adjust name if your compose project differs
> ```

---

**Run Localy**



---

**Database / Prisma**

Prisma schema: `backend/prisma/schema.prisma`.

Common Prisma commands (run from `backend`):

```bash
# Install deps in backend first
npx prisma generate
# Development: create migration and apply
npm run start:prisma
# Or push schema without generating a migration
npm run start:prisma:push
# For deployment
npm run start:prisma:migrate
```

If you're using Docker, the backend container includes scripts and expects a `DATABASE_URL` env var. When running migrations against the containerized Postgres, ensure the DB env vars in `.env` point to the running Postgres instance.

---

**Environment variables**

The `docker-compose.yml` and `backend` expect several environment variables. Create a `.env` file at the repository root (or provide them to the environment). Example keys used by the backend/service:

Required used variables (examples):

- `DATABASE_URL` (Prisma/Postgres connection URL)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `FILES_DEST` (file upload destination)
- `JWT_SECRET`, `AT_SECRET`, `RT_SECRET`, `JWT_REFRESH_TOKEN_SECRET`
- `JWT_EXPIRATION_TIME`, `JWT_REFRESH_TOKEN_EXPIRATION_TIME`
- `TWO_FACTOR_AUTHENTICATION_APP_NAME` (TFA app name shown in authenticators)
- `API_UID`, `API_SECRET` (42 OAuth client id & secret)
- `DOMAIN` (used in 42 OAuth callback URL construction)
- `CLIENT_REDIRECT_42` (frontend redirect target when using 42 auth)
- `IP_PUBLIC`, `SECRET` (used in some flows)

Example `.env` snippet (replace values):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=transcendance
POSTGRES_PORT=5432
POSTGRES_HOST=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/transcendance?schema=public
AT_SECRET=changeme_at_secret
RT_SECRET=changeme_rt_secret
API_UID=your_42_client_id
API_SECRET=your_42_client_secret
DOMAIN=localhost
FILES_DEST=./uploads
TWO_FACTOR_AUTHENTICATION_APP_NAME=Pong
```

Security note: Do not commit real secrets to source control.

---

**Architecture & Important files**

- `docker-compose.yml` — orchestrates `postgres`, `pgadmin`, `backend`, `frontend`.
- `Makefile` — convenient shortcuts (`make all`, `make down`, `make clean`, etc.).

Backend (server)
- `backend/Dockerfile` — container config.
- `backend/src/main.ts` — Nest application bootstrap (CORS, pipes, prefix `api`).
- `backend/src/app.module.ts` — high-level module imports (Auth, Prisma, Chat, Game, Room, User, TFA, Historic).
- `backend/src/*` — modules: `auth/`, `chat/`, `game/`, `room/`, `user/`, `tfa/`, `prisma/`, `historic/`.
- `backend/prisma/schema.prisma` — data model (User, Room, Message, Game, Historic).

Frontend (client)
- `frontend/Dockerfile` — container config.
- `frontend/src/main.ts` — app entry.
- `frontend/src/router` — routes and navigation guards.
- `frontend/src/store` — Vuex store (application state: user, rooms, game state).
- `frontend/src/components` and `frontend/src/views` — UI components (ChatDisplay, PongGame, MatchMaking, Profile, Home, etc.).

Realtime

- Socket.IO is used for realtime features.
- Backend WebSocket gateways: `backend/src/game/game.gateway.ts` (port `8081`) and `backend/src/chat/chat.gateway.ts` (port `8082`).
- Frontend connects to sockets in `frontend/src/utils/socket.ts` and `frontend/src/utils/gameSocket.ts`.

---

**Testing**

# backend (Jest)
```
docker compose run --rm backend npm run test -- chat
```
# frontend (Vitest)
```
docker compose run --rm frontend npm run test:unit
```

---

**Makefile shortcuts**

- `make all` — same as `docker compose up --build`.
- `make down` — `docker compose down`.
- `make stop` — `docker compose stop`.
- `make clean` — stops containers and removes containers.
- `make fclean` — aggressive prune (images, volumes, networks). Use with caution.
- `make status` — inspect docker compose status.
- `make test` - test bakcend and frontend

---

**License**

This repository includes a `LICENSE` file at the project root. Review it for terms.

---
