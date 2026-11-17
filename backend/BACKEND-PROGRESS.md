# 🚀 Bitácora de Implementación y Estado del Backend — Vocabulary App

> **Fecha de Actualización**: 2026-11-15  
> **Estado**: Autenticación, Aprendizaje Persistente y Almanaque Implementados  
> **Ubicación**: `vocabulary-app/backend/`  

---

## 📌 1. Lo que se ha implementado hasta ahora:

1. **Configuración de Proyecto**:
   - `package.json` con dependencias NestJS (`@nestjs/core`, `@nestjs/platform-fastify`, `@nestjs/swagger`, `@simplewebauthn/server`, `@prisma/client`, `ioredis`).
   - `tsconfig.json` y `nest-cli.json` con soporte para decoradores, TypeScript y alias `@common/*`, `@modules/*`.
   - `.env.example` con variables para PostgreSQL, Redis, WebAuthn Relying Party (`RP_ID`, `RP_NAME`, `ORIGIN`).
2. **Capa de Entrada y Servidor**:
   - `src/main.ts`: Configurado sobre Fastify adapter con cookies firmadas, CORS, Swagger en `/docs`, y validación global estricta con class-validator.
   - `src/app.module.ts`: Módulo raíz con `ConfigModule` global.
3. **Capa de Persistencia y Modelo Relacional**:
   - `prisma/schema.prisma`:
     - Modelos: `User`, `PasskeyCredential` (WebAuthn), `Category`, `Word`, `Sentence`, `SentenceWord` (grafo de oraciones para repaso implícito), `UserWordProgress` (`DISCOVERED`, `CONSOLIDATING`, `MASTERED`), `UserStreakLog`, `Achievement`, `UserAchievement`, y `WeeklyRecap`.
   - `src/common/prisma.service.ts`: Servicio singleton de conexión con lifecycle hooks de NestJS (`$connect` / `$disconnect`).
   - `src/common/database.module.ts`: Módulo global que registra y exporta `PrismaService`.
   - `LearningAttempt`: Registro idempotente de selección, resultado, latencia y transición de estado mediante `clientAttemptId` único.
4. **Contrato del Primer Incremento**:
   - Sesión explícita, reto actual sin fuga de respuesta e intento `PUT` idempotente.
   - El backend recibirá `selectedOptionId` y calculará `correct`; se eliminó la confianza en `isSuccess` enviado por el cliente.
   - Decisiones y límites documentados en `docs/implementation/MVP-001-learning-session.md`.
5. **`LearningModule` Persistente**:
   - Endpoints para crear sesión, obtener el reto actual y registrar intentos idempotentes.
   - Propiedad por usuario local, validación estricta, ocultación de respuesta, progreso `DISCOVERED`, racha y reencolado único.
   - Sesiones efímeras en Redis y transacción Prisma para intento, progreso y racha.
   - Idempotencia durable mediante `clientAttemptId` y resultado serializado.
6. **Autenticación y Almanaque**:
   - Registro/login Passkey con desafío de un solo uso, credenciales WebAuthn persistidas y cookie de sesión firmada `HttpOnly`.
   - Listado, búsqueda, filtros, detalle y métricas del Almanaque conectados a PostgreSQL.
   - PostgreSQL 16 y Redis 7 ejecutándose mediante `compose.yaml` con volúmenes persistentes.

---

## 📌 2. Hallazgos del Entorno:

- En el sistema Windows actual, **Bun 1.4.2** está disponible globalmente en `C:\Users\ampie\.bun\bin\bun.exe`.
- Las herramientas `node` y `npm` no están mapeadas en el `PATH` global de esta consola (o no están instaladas formalmente como binario standalone).
- Se puede instalar las dependencias con Bun (`bun install`) o instalando Node.js LTS en Windows si se prefiere ejecución nativa en Node.

---

## 📌 3. Próximos pasos a seguir para continuar:

1. **Siguientes incrementos de producto**:
   - Diagnóstico inicial, OAuth/Magic Link de respaldo, logros y recapitulación semanal.
   - Ampliar el catálogo y sustituir las ilustraciones iniciales por fotografía editorial cuando exista un pipeline de contenido.
