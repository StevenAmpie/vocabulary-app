# Vocabulary App

Monorepo de la aplicación de vocabulario visual: `frontend/` (React y Vite),
`backend/` (NestJS, Prisma y Fastify) y `compose.yaml` (PostgreSQL y Redis).

Incluye 12 objetos y 50 verbos frecuentes. Las fotografías y pronunciaciones se
guardan en `frontend/public/media`; las fichas, ejemplos y créditos están en
`content/`. No se descargan imágenes ni audios durante el uso de la aplicación.

## Requisitos

- Docker Engine con Compose en la VM.
- Bun instalado para el usuario que ejecutará la app.
- Puertos locales 3000, 4000, 5432 y 6379 libres en la VM.

## Clonar y ejecutar en una VM Linux

```bash
git clone https://github.com/StevenAmpie/vocabulary-app.git
cd vocabulary-app
docker compose up -d --wait

cp backend/.env.example backend/.env
# Cambia COOKIE_SECRET por una cadena aleatoria: openssl rand -hex 32

cd backend
bun install --frozen-lockfile
bunx prisma migrate deploy
bunx prisma db seed
bun run start:dev
```

En otra terminal de la VM:

```bash
cd vocabulary-app/frontend
bun install --frozen-lockfile
bun run dev -- --host 127.0.0.1 --port 3000
```

Desde tu computadora, abre el túnel (sustituye usuario y dirección de la VM):

```bash
ssh -L 3000:127.0.0.1:3000 usuario@direccion-vm
```

Abre `http://localhost:3000` en tu computadora. El frontend envía `/api` al backend
por el proxy de Vite; PostgreSQL y Redis quedan limitados a loopback en la VM.
El túnel permite usar Passkeys con `RP_ID=localhost` y `ORIGIN=http://localhost:3000`.

`backend/.env` contiene la configuración privada y no se versiona. Para usar un
dominio HTTPS en vez de `localhost`, ajusta `FRONTEND_URL`, `ORIGIN` y `RP_ID`, y
configura un proxy HTTPS para ambos servicios.

Para detener los servicios de datos: `docker compose down`. Los datos persisten en
volúmenes de Docker.

Después de actualizar un clon existente, ejecuta `git pull`,
`cd backend`, `bunx prisma migrate deploy` y `bunx prisma db seed` para aplicar
el contenido nuevo a PostgreSQL. La carga usa `upsert` y puede repetirse.

Las fotografías provienen de Wikimedia Commons; consulta
[`content/IMAGE_CREDITS.md`](content/IMAGE_CREDITS.md) y los créditos que aparecen
en cada ficha. Los objetos tienen su propio registro en
[`content/OBJECT_IMAGE_CREDITS.md`](content/OBJECT_IMAGE_CREDITS.md) y sus datos
de atribución en `content/noun-images.json`.
