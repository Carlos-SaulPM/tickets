# Sistema de Tickets

Backend + frontend con Docker. Login JWT, perfil y gestión de usuarios para administradores.

## Inicio rápido

```bash
cp .env.example .env
docker compose up -d --build
```

- Frontend: <http://localhost:3001/login>
- API: <http://localhost:3000/api/v1>
- Prueba API: <http://localhost:3000/api/v1/holamundo>

### Credenciales de prueba

| Rol           | Correo                | Contraseña   |
| ------------- | --------------------- | ------------ |
| Administrador | `admin@example.com`   | `admin123`   |
| Soporte       | `soporte@example.com` | `soporte123` |
| Usuario       | `usuario@example.com` | `usuario123` |

Datos de seed en PostgreSQL. Se recrean con `pnpm prisma db seed`.

## Cómo funciona

- No hay registro público. Un administrador crea las cuentas.
- Al crear un usuario, el backend genera una contraseña temporal y el frontend la muestra una sola vez.
- El login devuelve un JWT. El frontend lo guarda y lo envía como `Authorization: Bearer`.
- `Administrador` entra a `/users`; `Soporte` y `Usuario` entran a `/perfil`.
- `/users` y `/roles` exigen JWT y rol `Administrador` en el backend.
- El token expira según `JWT_EXPIRES_IN` (3600 s por defecto). No hay refresh: hay que volver a iniciar sesión.

## API

| Método   | Ruta                           | Acceso              |
| -------- | ------------------------------ | ------------------- |
| `POST`   | `/api/v1/autenticacion/login`  | Público             |
| `GET`    | `/api/v1/autenticacion/perfil` | JWT                 |
| `GET`    | `/api/v1/users`                | JWT + Administrador |
| `POST`   | `/api/v1/users`                | JWT + Administrador |
| `PATCH`  | `/api/v1/users/:id`            | JWT + Administrador |
| `DELETE` | `/api/v1/users/:id`            | JWT + Administrador |
| `GET`    | `/api/v1/roles`                | JWT + Administrador |
| `GET`    | `/api/v1/holamundo`            | Público             |

Login:

```json
{ "correo_electronico": "admin@example.com", "contrasena": "admin123" }
```

## Stack

- **Backend:** Node 24, Express 5, TypeScript, Prisma 7, Zod, argon2, jsonwebtoken. Tests con Vitest, Supertest y Testcontainers.
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, react-hook-form, sonner. Tests con Vitest y Testing Library.
- **Datos:** PostgreSQL 17.
- **Gestor:** pnpm 12.10.1.
- **Infra:** Docker Compose.

## Estructura

```text
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── modules/autenticacion/
│       ├── modules/users/
│       ├── modules/roles/
│       ├── middlewares/auth.middleware.ts
│       └── routes/
└── frontend/tickets_frontend/
    ├── app/login/
    ├── app/perfil/
    ├── app/users/
    ├── lib/api.ts
    ├── lib/session.ts
    ├── hooks/use-auth.ts
    ├── services/
    └── test/
```

## Desarrollo

```bash
docker compose logs -f app frontend   # logs
docker compose exec app sh            # shell backend
docker compose exec frontend sh       # shell frontend
```

| Acción                   | Comando                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Lint backend             | `docker compose exec app pnpm lint`                                                |
| Typecheck backend        | `docker compose exec app pnpm typecheck`                                           |
| Tests backend            | `cd backend && pnpm test`                                                          |
| Tests frontend           | `cd frontend/tickets_frontend && pnpm test`                                        |
| Lint frontend            | `docker compose exec frontend pnpm lint`                                           |
| Build frontend           | `docker compose exec frontend pnpm build`                                          |
| Formatear                | `docker compose exec app pnpm format` / `docker compose exec frontend pnpm format` |
| Migración nueva          | `docker compose exec app pnpm prisma migrate dev --name <nombre>`                  |
| Seed de datos            | `docker compose exec app pnpm prisma db seed`                                      |
| Reconstruir dependencias | `docker compose build app frontend && docker compose up -d`                        |
| Apagar                   | `docker compose down`                                                              |
| Apagar y borrar BD       | `docker compose down -v`                                                           |

Los cambios en `backend/src` o `frontend/tickets_frontend` se recargan solos.

Los tests de backend usan Testcontainers: levantan un PostgreSQL temporal y requieren Docker en el host.

## Producción

Edita `.env`:

```bash
COMPOSE_PROFILES=prod
POSTGRES_PASSWORD=<segura>
JWT_SECRET=<mínimo 32 caracteres>
NEXT_PUBLIC_API_URL=http://IP_O_DOMINIO:8080/api/v1
```

Luego:

```bash
docker compose up -d --build
```

- Frontend: <http://IP_O_DOMINIO:8081>
- Backend: <http://IP_O_DOMINIO:8080/api/v1>

`NEXT_PUBLIC_API_URL` se compila dentro de la imagen de `frontend-prod`. Si lo cambias, reconstruye ese servicio.

Para 80/443 usa un reverse proxy (nginx, Caddy, Traefik).

## Variables de entorno

| Variable              | Por defecto                    | Descripción                       |
| --------------------- | ------------------------------ | --------------------------------- |
| `COMPOSE_PROFILES`    | `dev`                          | `dev` o `prod`                    |
| `POSTGRES_USER`       | `postgres`                     | Usuario de PostgreSQL             |
| `POSTGRES_PASSWORD`   | `postgres`                     | Contraseña de PostgreSQL          |
| `POSTGRES_DB`         | `tickets`                      | Nombre de la base                 |
| `JWT_SECRET`          | —                              | Firma JWT, mínimo 32 caracteres   |
| `JWT_EXPIRES_IN`      | `3600`                         | Duración del token en segundos    |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | URL del backend para el navegador |
| `APP_PORT`            | `3000`                         | Backend dev                       |
| `FRONTEND_PORT`       | `3001`                         | Frontend dev                      |
| `APP_PROD_PORT`       | `8080`                         | Backend prod                      |
| `FRONTEND_PROD_PORT`  | `8081`                         | Frontend prod                     |

`DATABASE_URL` la construye Compose con las variables `POSTGRES_*`.

## Notas

- No edites archivos dentro de los contenedores; edita en el repo.
- Esta versión reemplaza el esquema anterior. Si tienes el volumen `pgdata` viejo, ejecuta `docker compose down -v` una vez antes de arrancar.
- `node_modules`, `src/generated` y `.next` son artefactos.
- El token se guarda en `localStorage`. Es simple; para producción real conviene una cookie `httpOnly`.
- Para reiniciar todo desde cero:

  ```bash
  docker compose down -v --rmi local --remove-orphans
  docker compose up -d --build
  ```
