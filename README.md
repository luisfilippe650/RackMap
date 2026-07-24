# RackMap

RackMap is a local web application for viewing rack and location data using a Node/Fastify backend, a React/Vite frontend, Prisma, and MariaDB.

## Requirements

- Docker and Docker Compose
- Node.js 22, only if you want to run services outside Docker

## Quick Start With Docker

From the project root, run:

```bash
docker compose up
```

To run in the background:

```bash
docker compose up -d
```

The Compose stack starts:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3333
- MariaDB: localhost:3306

Check the backend health endpoint:

```bash
curl http://localhost:3333/health
```

Stop the stack:

```bash
docker compose down
```

Stop the stack and remove the database and dependency volumes:

```bash
docker compose down -v
```

## Docker Services

The `docker-compose.yml` file defines:

- `frontend`: runs the Vite development server on port `5173`
- `backend`: runs the Fastify API on port `3333`
- `mysql-db`: runs MariaDB 11.4 and loads `database/database.sql` on first initialization

The backend waits for MariaDB to become healthy before starting. The frontend waits for the backend healthcheck before starting.

## Environment Variables

The backend reads these variables:

```env
DATABASE_URL="mysql://rackmap:rackmap@127.0.0.1:3306/rackmap"
RACKTABLES_API_URL="http://localhost:8000"
RACKTABLES_RACKS_PATH="/v1/racktables/racks/"
RACKTABLES_LOCATIONS_ROWS_PATH="/v1/racktables/locations/rows"
# RACKTABLES_API_TOKEN=""
```

For Docker, `DATABASE_URL` is set automatically to use the MariaDB service:

```env
mysql://rackmap:rackmap@mysql-db:3306/rackmap
```

The Compose default for `RACKTABLES_API_URL` is `http://host.docker.internal:8000`, so the backend container can reach a RackTables API running on your host machine.

You can override RackTables values when starting Compose:

```bash
RACKTABLES_API_URL=http://host.docker.internal:8000 docker compose up
```

## Local Development Without Docker

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate --schema backend/prisma/schema.prisma
```

Start the backend:

```bash
npm run dev
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

The Vite dev server proxies `/v1` and `/health` to `http://localhost:3333` by default. To use another backend URL:

```bash
BACKEND_PROXY_TARGET=http://localhost:3333 npm run dev:frontend
```

## Useful Commands

```bash
docker compose config
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql-db
npm run build:frontend
```
