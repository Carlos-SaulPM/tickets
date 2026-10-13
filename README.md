# Sistema de Tickets — Backend

Backend del sistema de tickets de soporte.

Todo corre con **Docker**. No necesitas instalar Node.js, pnpm ni PostgreSQL en tu computadora.

## Requisitos

- Docker con Docker Compose (Docker Desktop ya lo incluye; en Linux es el plugin `docker compose`).

Verifica que lo tengas:

```bash
docker compose version
```

## Levantar en desarrollo (primera vez)

```bash
git clone <url-del-repo>
cd tickets
docker compose up --build
```

La primera vez tarda unos minutos (descarga imágenes y compila). Cuando termine, abre:

- http://localhost:3000/api/v1/holamundo

Debe responder `{"mensaje":"Hola Mundo"}`.

Al levantar, Docker hace todo solo: crea la base de datos, aplica las migraciones y arranca el backend en modo desarrollo.

## Trabajar día a día

- Edita los archivos de `backend/src/` con tu editor normal. Al guardar, el servidor se reinicia solo (recarga en caliente).
- Ver registros: `docker compose logs -f app`
- Apagar: `docker compose down` (los datos de la base de datos se conservan)
- Apagar y borrar también la base de datos: `docker compose down -v`

## Cambios que necesitan un comando extra

| Quieres... | Comando |
|---|---|
| Agregar una dependencia | `docker compose exec app pnpm add <paquete>` |
| Abrir una terminal dentro del contenedor | `docker compose exec app sh` |
| Cambiaste `backend/prisma/schema.prisma` | `docker compose restart app` (regenera el cliente) |
| Agregar una migración nueva | `docker compose run --rm migrate` |

## Levantar en producción

```bash
docker compose --profile prod up -d --build app-prod
```

Queda disponible en http://localhost:8080

## Servicios que crea

| Servicio | Qué es | Dirección |
|---|---|---|
| `db` | PostgreSQL (datos guardados en el volumen `pgdata`) | interna |
| `migrate` | Aplica las migraciones y termina | — |
| `app` | Backend en desarrollo | http://localhost:3000 |
| `app-prod` | Backend en producción (solo con `--profile prod`) | http://localhost:8080 |

## Configuración (opcional)

Los valores por defecto funcionan sin tocar nada. Si quieres cambiarlos (puerto, usuario/clave de la base de datos):

```bash
cp .env.example .env
# edita .env y vuelve a levantar
```

## Notas

- No edites archivos dentro del contenedor: edita en `backend/` y el cambio se refleja.
- `backend/node_modules` y `backend/src/generated` son artefactos; se crean solos, no los toques.
- El frontend no está incluido en este `docker-compose.yml`.
