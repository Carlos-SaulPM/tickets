# Sistema de Tickets

Backend + frontend con Docker. Login JWT, perfil y gestión de usuarios para administradores.

## Inicio rápido

```bash
cp .env.example .env
docker compose up -d --build
```

- Frontend: <http://localhost:3001> (redirige a `/tickets` o a `/login` según la sesión)
- API: <http://localhost:3000/api/v1>
- Prueba API: <http://localhost:3000/api/v1/holamundo>

### Credenciales de prueba

| Rol           | Correo                | Contraseña   |
| ------------- | --------------------- | ------------ |
| Administrador | `admin@example.com`   | `admin123`   |
| Soporte       | `soporte@example.com` | `soporte123` |
| Usuario       | `usuario@example.com` | `usuario123` |

Datos de seed en PostgreSQL. Se recrean con `pnpm prisma db seed`.

El seed también crea el ticket `#TK-DEMO` con tres mensajes y cinco imágenes: cuatro enlazadas (una de ellas suelta, sin incrustar) y una huérfana de hace 48 h para probar `pnpm db:limpiar-adjuntos`. Las imágenes de ejemplo viven en `backend/prisma/seed-assets/` y se copian a `UPLOADS_DIR`; el servicio `migrate` monta el volumen `uploads` para que el backend las vea.

## Cómo funciona

- No hay registro público. Un administrador crea las cuentas.
- Al crear un usuario, el backend genera una contraseña temporal y el frontend la muestra una sola vez.
- Un administrador no puede eliminarse ni darse de baja a sí mismo.
- El login devuelve un JWT. El frontend lo guarda y lo envía como `Authorization: Bearer`.
- La raíz `/` no tiene pantalla propia: manda a `/tickets` si hay sesión y a `/login` si no.
- `/login` también redirige a `/tickets` cuando ya hay sesión.
- `Administrador` entra a `/users`; `Soporte` y `Usuario` entran a `/perfil`.
- `/users` y `/roles` exigen JWT y rol `Administrador` en el backend.
- El token expira según `JWT_EXPIRES_IN` (3600 s por defecto). No hay refresh: hay que volver a iniciar sesión.

## Estado actual

Implementado:

- Login JWT y perfil.
- CRUD de usuarios.
- Catálogo de roles.
- Áreas y categorías.
- Tickets: crear, listar, ver, asignar, editar y cerrar.
- Mensajes, notas internas y propuestas de solución.
- Aprobar/rechazar propuesta.
- Historial y notificaciones in-app, con campana en la navbar y página `/notificaciones`.
- Correo de cada aviso vía SMTP; en desarrollo lo captura Mailpit (`http://localhost:8025`).
- Avisos por evento: crear un ticket no notifica; el creador recibe correo cuando Soporte responde, propone o cierra; el Soporte asignado recibe al asignarle el ticket y cuando el creador responde. Las notas internas no avisan. El Administrador ve la campana pero no recibe correo.
- Áreas filtrables por estado (`?activo=true|false|all`).
- UI de tickets: listado con filtros y paginación, creación y detalle con timeline de actividad.
- Timeline del ticket: creación, cambios de estado, reasignación, prioridad y mensajes en orden cronológico.
- Aprobar la solución cierra el ticket; rechazarla lo devuelve a En proceso.
- Un ticket cerrado o resuelto no admite mensajes ni adjuntos nuevos (400 en la API).
- Editor enriquecido en las respuestas (negrita, cursiva, títulos, listas, enlaces).
- Adjuntos de imagen por mensaje (hasta 5 de 5 MB), con texto alternativo: botón, pegar o arrastrar varias a la vez.
- El mensaje solo enlaza las imágenes que siguen visibles en el editor: si borras una, no se envía.
- Ticket de demostración `#TK-DEMO` en el seed, con imágenes incrustadas, un adjunto suelto y uno huérfano.
- Tarjeta de Soporte asignado con nombre, correo y fecha en que tomó el ticket.
- Soporte puede tomar tickets sin asignar; el Administrador puede asignar o reasignar.
- Propuesta de solución desde el compositor del Soporte asignado.
- Soporte debe tomar el ticket antes de responder (`403` si intenta hacerlo sin asignación).
- Seed de roles, áreas, categorías, usuarios y el ticket de demostración `#TK-DEMO`.
- Modelo Prisma completo.

Pendiente:

- UI de catálogos.
- Visibilidad de Soporte por área: el schema no relaciona usuarios con áreas; hoy Soporte ve tickets sin asignar o asignados a él.
- Cierre automático por inactividad: fuera de alcance por ahora (proyecto escolar).

## Datos de demostración

Para enseñar el sistema con volumen real (60 tickets y 15 usuarios):

```bash
docker compose exec app pnpm db:demo                # borra lo anterior y recrea
docker compose exec app pnpm db:demo --tickets=20   # volumen reducido
docker compose exec app pnpm db:demo:limpiar        # solo borra
```

O pon `SEED_DEMO=true` en `.env` y el servicio `migrate` los carga en cada `docker compose up`. **No lo actives en producción** y ten en cuenta que cada `up` borra y recrea los datos de demostración.

Todas las cuentas de demostración usan la contraseña `demo123`:

| Nombre                | Correo                  | Contraseña | Rol     |
| --------------------- | ----------------------- | ---------- | ------- |
| Laura Méndez Ruiz     | `soporte2@demo.local`   | `demo123`  | Soporte |
| Iván Ramírez Soto     | `soporte3@demo.local`   | `demo123`  | Soporte |
| Nadia Cortés Bravo    | `soporte4@demo.local`   | `demo123`  | Soporte |
| Emilio Fuentes Lara   | `soporte5@demo.local`   | `demo123`  | Soporte |
| Mariana Ortiz Peña    | `usuario2@demo.local`   | `demo123`  | Usuario |
| Diego Salas Núñez     | `usuario3@demo.local`   | `demo123`  | Usuario |
| Paola Vega Herrera    | `usuario4@demo.local`   | `demo123`  | Usuario |
| Andrés Lima Castro    | `usuario5@demo.local`   | `demo123`  | Usuario |
| Sofía Ríos Delgado    | `usuario6@demo.local`   | `demo123`  | Usuario |
| Héctor Cano Mejía     | `usuario7@demo.local`   | `demo123`  | Usuario |
| Lucía Paredes Rangel  | `usuario8@demo.local`   | `demo123`  | Usuario |
| Raúl Ibarra Solís     | `usuario9@demo.local`   | `demo123`  | Usuario |
| Elena Mora Quintero   | `usuario10@demo.local`  | `demo123`  | Usuario |
| Tomás Aguilar Pineda  | `usuario11@demo.local`  | `demo123`  | Usuario |
| Renata Solís Márquez  | `usuario12@demo.local`  | `demo123`  | Usuario |

Las cuentas base (`admin@example.com`, `soporte@example.com`, `usuario@example.com`) siguen disponibles con sus contraseñas de la tabla de arriba.

Tickets `#D-001` … `#D-060`:

| Estado              | Cantidad |
| ------------------- | -------- |
| Abierto sin asignar | 10       |
| Abierto asignado    | 8        |
| En proceso          | 14       |
| En revisión         | 10       |
| Resuelto            | 9        |
| Cerrado             | 9        |

Incluyen mensajes, notas internas, propuestas pendientes, imágenes incrustadas, adjuntos sueltos, notificaciones leídas y sin leer, y tres adjuntos huérfanos (6 h, 30 h y 72 h) para probar `pnpm db:limpiar-adjuntos`.

Los datos de demostración se reconocen por el prefijo `#D-` en el código y `@demo.local` en el correo. La limpieza no toca a los tres usuarios base, los catálogos ni el ticket `#TK-DEMO`.

## Modelo de datos

Tablas: `roles`, `usuarios`, `areas`, `categorias`, `tickets`, `ticket_mensajes`, `archivos_adjuntos`, `historial_tickets`, `notificaciones`.

Estados de ticket:

```text
Abierto → En_proceso → En_revision → Resuelto → Cerrado
```

`En_revision` espera aprobación del usuario. `PROPUESTA_SOLUCION` registra la propuesta formal en el historial.

## API

| Método   | Ruta                               | Acceso                           |
| -------- | ---------------------------------- | -------------------------------- |
| `POST`   | `/api/v1/autenticacion/login`      | Público                          |
| `GET`    | `/api/v1/autenticacion/perfil`     | JWT                              |
| `GET`    | `/api/v1/users`                    | JWT + Administrador              |
| `POST`   | `/api/v1/users`                    | JWT + Administrador              |
| `PATCH`  | `/api/v1/users/:id`                | JWT + Administrador              |
| `DELETE` | `/api/v1/users/:id`                | JWT + Administrador              |
| `GET`    | `/api/v1/roles`                    | JWT + Administrador              |
| `GET`    | `/api/v1/areas`                    | JWT (`?activo=true\|false\|all`) |
| `POST`   | `/api/v1/areas`                    | Administrador                    |
| `PATCH`  | `/api/v1/areas/:id`                | Administrador                    |
| `GET`    | `/api/v1/categorias`               | JWT                              |
| `POST`   | `/api/v1/categorias`               | Administrador                    |
| `PATCH`  | `/api/v1/categorias/:id`           | Administrador                    |
| `GET`    | `/api/v1/tickets`                  | JWT (filtros y paginación)       |
| `POST`   | `/api/v1/tickets`                  | JWT                              |
| `GET`    | `/api/v1/tickets/:id`              | JWT                              |
| `PATCH`  | `/api/v1/tickets/:id`              | Administrador                    |
| `POST`   | `/api/v1/tickets/:id/asignar`      | Admin o Soporte                  |
| `PATCH`  | `/api/v1/tickets/:id/estado`       | Admin o Soporte asignado         |
| `GET`    | `/api/v1/tickets/:id/mensajes`     | JWT                              |
| `POST`   | `/api/v1/tickets/:id/mensajes`     | JWT                              |
| `POST`   | `/api/v1/tickets/:id/aprobar`      | Creador                          |
| `POST`   | `/api/v1/tickets/:id/rechazar`     | Creador                          |
| `GET`    | `/api/v1/tickets/:id/historial`    | JWT                              |
| `POST`   | `/api/v1/tickets/:id/adjuntos`     | JWT (autorizado en el ticket)    |
| `GET`    | `/api/v1/adjuntos/:id`             | JWT (autorizado en el ticket)    |
| `GET`    | `/api/v1/notificaciones`           | JWT (`limite`, `no_leidas`)      |
| `PATCH`  | `/api/v1/notificaciones/leidas`    | JWT                              |
| `PATCH`  | `/api/v1/notificaciones/:id/leida` | JWT                              |
| `GET`    | `/api/v1/holamundo`                | Público                          |

Login:

```json
{ "correo_electronico": "admin@example.com", "contrasena": "admin123" }
```

### Filtros y paginación de tickets

`GET /api/v1/tickets` acepta:

| Parámetro      | Tipo              | Por defecto |
| -------------- | ----------------- | ----------- |
| `estado`       | `EstadoTicket`    | todos       |
| `prioridad`    | `PrioridadTicket` | todas       |
| `area_id`      | uuid              | todas       |
| `categoria_id` | uuid              | todas       |
| `buscar`       | texto (1-100)     | —           |
| `pagina`       | entero ≥ 1        | `1`         |
| `limite`       | entero 1-100      | `20`        |

`buscar` compara contra `codigo`, `asunto` y `descripcion` sin distinguir mayúsculas.

```json
{
  "message": "Tickets obtenidos con éxito",
  "data": [],
  "meta": { "pagina": 1, "limite": 20, "total": 42, "total_paginas": 3 }
}
```

Los filtros se combinan con la visibilidad del rol, así que un Usuario nunca ve tickets ajenos aunque filtre.

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
│       ├── test/unit/
│       ├── test/integration/
│       └── routes/
└── frontend/tickets_frontend/
    ├── app/page.tsx (redirige a /tickets o /login)
    ├── app/tickets/
    ├── app/tickets/nuevo/
    ├── app/tickets/[id]/
    ├── app/login/
    ├── app/perfil/
    ├── app/users/
    ├── lib/api.ts
    ├── lib/sesion.ts
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

| Acción                     | Comando                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Lint backend               | `docker compose exec app pnpm lint`                                                |
| Typecheck backend          | `docker compose exec app pnpm typecheck`                                           |
| Tests backend              | `cd backend && pnpm test`                                                          |
| Tests frontend             | `cd frontend/tickets_frontend && pnpm test`                                        |
| Lint frontend              | `docker compose exec frontend pnpm lint`                                           |
| Build frontend             | `docker compose exec frontend pnpm build`                                          |
| Formatear                  | `docker compose exec app pnpm format` / `docker compose exec frontend pnpm format` |
| Migración nueva            | `docker compose exec app pnpm prisma migrate dev --name <nombre>`                  |
| Seed de datos              | `docker compose exec app pnpm prisma db seed`                                      |
| Limpiar adjuntos huérfanos | `docker compose exec app pnpm db:limpiar-adjuntos [horas]` (24 por defecto)        |
| Datos de demostración      | `docker compose exec app pnpm db:demo [--tickets=N]`                               |
| Borrar datos de demo       | `docker compose exec app pnpm db:demo:limpiar`                                     |
| Reconstruir dependencias   | `docker compose build app frontend && docker compose up -d`                        |
| Apagar                     | `docker compose down`                                                              |
| Apagar y borrar BD         | `docker compose down -v`                                                           |

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

| Variable              | Por defecto                    | Descripción                                      |
| --------------------- | ------------------------------ | ------------------------------------------------ |
| `COMPOSE_PROFILES`    | `dev`                          | `dev` o `prod`                                   |
| `POSTGRES_USER`       | `postgres`                     | Usuario de PostgreSQL                            |
| `POSTGRES_PASSWORD`   | `postgres`                     | Contraseña de PostgreSQL                         |
| `POSTGRES_DB`         | `tickets`                      | Nombre de la base                                |
| `JWT_SECRET`          | —                              | Firma JWT, mínimo 32 caracteres                  |
| `JWT_EXPIRES_IN`      | `3600`                         | Duración del token en segundos                   |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | URL del backend para el navegador                |
| `API_URL_INTERNA`     | `http://app:3000/api/v1`       | URL del backend para SSR                         |
| `UPLOADS_DIR`         | `./uploads`                    | Carpeta de imágenes en el backend                |
| `FRONTEND_URL`        | `http://localhost:3001`        | Base de los enlaces en los correos               |
| `SMTP_HOST`           | `mailpit` (dev)                | Servidor SMTP; vacío desactiva el envío real     |
| `SMTP_PORT`           | `1025`                         | Puerto SMTP                                      |
| `SMTP_SECURE`         | `false`                        | `true` para TLS implícito (puerto 465)           |
| `SMTP_USER`           | —                              | Usuario SMTP                                     |
| `SMTP_PASS`           | —                              | Contraseña SMTP                                  |
| `SMTP_FROM`           | `Sistema de Tickets <…>`       | Remitente de los correos                         |
| `MAILPIT_PORT`        | `8025`                         | Bandeja de Mailpit en el host                    |
| `SEED_DEMO`           | `false`                        | Carga 60 tickets y 15 usuarios demo en cada `up` |
| `APP_PORT`            | `3000`                         | Backend dev                                      |
| `FRONTEND_PORT`       | `3001`                         | Frontend dev                                     |
| `APP_PROD_PORT`       | `8080`                         | Backend prod                                     |
| `FRONTEND_PROD_PORT`  | `8081`                         | Frontend prod                                    |

`DATABASE_URL` la construye Compose con las variables `POSTGRES_*`.

## Notas

- El nombre visible del sistema y su descripción viven en `frontend/tickets_frontend/lib/marca.ts`. Cámbialos por los del cliente y se actualizan el login, la barra de navegación y el título de la pestaña.
- Los correos se capturan en Mailpit durante el desarrollo: bandeja en <http://localhost:8025>. En producción configura `SMTP_*` con tu proveedor; si `SMTP_HOST` queda vacío, los avisos solo se registran en consola y la operación continúa igual.
- No edites archivos dentro de los contenedores; edita en el repo.
- Esta versión reemplaza el esquema anterior. Si tienes el volumen `pgdata` viejo, ejecuta `docker compose down -v` una vez antes de arrancar.
- `node_modules`, `src/generated` y `.next` son artefactos. Las imágenes subidas viven en el volumen `uploads`, no en el repo.
- `src/generated` se genera dentro del contenedor en un volumen anónimo, así que no ensucia el repo. Para correr los tests de backend en el host, ejecuta antes `pnpm exec prisma generate`.
- El token se guarda en `localStorage`. Es simple; para producción real conviene una cookie `httpOnly`.
- Para reiniciar todo desde cero:

  ```bash
  docker compose down -v --rmi local --remove-orphans
  docker compose up -d --build
  ```
