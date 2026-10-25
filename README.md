# Sistema de Tickets

Sistema de tickets de soporte con backend y frontend. Todo corre con **Docker**: no necesitas instalar Node.js, pnpm ni PostgreSQL en tu computadora.

## Stack

- **Backend:** Node 24, Express 5, TypeScript, Prisma 7 (PostgreSQL) y Zod.
- **Frontend:** Next.js 16 (App Router, Turbopack), React 19 y Tailwind CSS 4. `shadcn/ui` pendiente.
- **Infra:** Docker Compose y PostgreSQL 17.

## Estructura

```text
.
├── docker-compose.yml
├── .env.example
├── backend/                  # API (Express + Prisma)
│   ├── Dockerfile
│   ├── prisma/
│   └── src/
└── frontend/
    └── tickets_frontend/     # Next.js
        ├── Dockerfile
        └── app/
```

## Requisitos

- Docker con Docker Compose v2.

```bash
docker compose version
```

## Puesta en marcha (desarrollo)

```bash
git clone <url-del-repo>
cd tickets
cp .env.example .env
docker compose up -d --build
```

`.env.example` trae `COMPOSE_PROFILES=dev`, así que esto levanta `db`, `migrate`, `app` y `frontend`. La primera vez tarda unos minutos (descarga imágenes, instala dependencias y compila).

Cuando termine:

- Frontend: <http://localhost:3001>
- Backend: <http://localhost:3000/api/v1/holamundo> → `{"mensaje":"Hola Mundo"}`

Estado y registros:

```bash
docker compose ps
docker compose logs -f app frontend
```

Al arrancar, `migrate` crea/aplica las migraciones y termina; después arrancan las apps.

## Alternar entre desarrollo y producción

El perfil activo se define en `.env`:

```bash
COMPOSE_PROFILES=dev    # desarrollo: app + frontend con recarga en caliente
COMPOSE_PROFILES=prod   # producción: app-prod + frontend-prod compilados
```

Para cambiar de entorno:

```bash
docker compose --profile dev --profile prod down
# edita COMPOSE_PROFILES en .env
docker compose up -d --build
```

> No combines `COMPOSE_PROFILES` con `--profile` en el mismo comando: los perfiles se suman y levantarías ambos entornos.

## Trabajo diario (desarrollo)

Edita `backend/src/` o `frontend/tickets_frontend/app/` con tu editor normal: al guardar, cada app se recarga sola (tsx watch / Turbopack).

| Quieres... | Comando |
|---|---|
| Ver registros | `docker compose logs -f app` (o `frontend`) |
| Abrir una terminal | `docker compose exec app sh` / `docker compose exec frontend sh` |
| Agregar una dependencia | `docker compose exec app pnpm add <paquete>` y luego `docker compose build app && docker compose up -d app` (igual para `frontend`) |
| Cambiaste `backend/prisma/schema.prisma` | `docker compose restart app` (regenera el cliente Prisma) |
| Crear una migración nueva | `docker compose exec app pnpm prisma migrate dev --name <nombre>` |
| Aplicar migraciones pendientes | `docker compose run --rm migrate` |
| Formatear código | `docker compose exec app pnpm format` / `docker compose exec frontend pnpm format` |
| Verificar formato | `docker compose exec app pnpm format:check` / `docker compose exec frontend pnpm format:check` |
| Lint / tipos (backend) | `docker compose exec app pnpm lint` / `docker compose exec app pnpm typecheck` |
| Lint (frontend) | `docker compose exec frontend pnpm lint` |
| Apagar (conserva la BD) | `docker compose down` |
| Apagar y borrar la BD | `docker compose down -v` |

> Si cambian `package.json` o `pnpm-lock.yaml` (dependencias nuevas o un `git pull`), reconstruye: `docker compose build app frontend && docker compose up -d`.

## Producción (VPS)

```bash
git clone <url-del-repo> tickets
cd tickets
cp .env.example .env
# edita .env: COMPOSE_PROFILES=prod y una POSTGRES_PASSWORD segura
docker compose up -d --build
```

- Frontend: <http://IP_DEL_VPS:8081>
- Backend: <http://IP_DEL_VPS:8080/api/v1/holamundo>

El servicio `migrate` aplica las migraciones antes de arrancar las apps. Los puertos se cambian con `APP_PROD_PORT` y `FRONTEND_PROD_PORT`. Para servir en 80/443, pon un reverse proxy (nginx, Caddy, Traefik) delante.

## Servicios

| Servicio | Perfil | Descripción | Puerto en el host |
|---|---|---|---|
| `db` | — | PostgreSQL 17 (datos en el volumen `pgdata`) | interno |
| `migrate` | — | Aplica migraciones y termina | — |
| `app` | `dev` | Backend con tsx watch | 3000 |
| `frontend` | `dev` | Next.js en modo desarrollo (Turbopack) | 3001 |
| `app-prod` | `prod` | Backend compilado (usuario no root) | 8080 |
| `frontend-prod` | `prod` | Next.js standalone (usuario no root) | 8081 |

## Variables de entorno (`.env`)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `COMPOSE_PROFILES` | `dev` | Perfil activo: `dev` o `prod` |
| `POSTGRES_USER` | `postgres` | Usuario de la base de datos |
| `POSTGRES_PASSWORD` | `postgres` | Contraseña (cámbiala en producción) |
| `POSTGRES_DB` | `tickets` | Nombre de la base de datos |
| `APP_PORT` | `3000` | Puerto del backend en desarrollo |
| `FRONTEND_PORT` | `3001` | Puerto del frontend en desarrollo |
| `APP_PROD_PORT` | `8080` | Puerto del backend en producción |
| `FRONTEND_PROD_PORT` | `8081` | Puerto del frontend en producción |

`DATABASE_URL` la construye Docker Compose a partir de las variables `POSTGRES_*`; no hace falta definirla.

## Notas

- No edites archivos dentro del contenedor: edita en `backend/` o `frontend/` y el cambio se refleja.
- `node_modules`, `src/generated` y `.next` son artefactos; se generan solos.
- Desarrollo y producción comparten el volumen `pgdata` (mismo proyecto de Compose): si cambias de perfil sin `-v`, reutilizas la misma base de datos.
- Para empezar de cero (contenedores, volúmenes e imágenes construidas):

  ```bash
  docker compose --profile dev --profile prod down -v --rmi local --remove-orphans
  docker compose up -d --build
  ```
