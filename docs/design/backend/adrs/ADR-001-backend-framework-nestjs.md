# ADR-001: Selección del Framework Backend (NestJS) y Stack Tecnológico

> **Estado**: Aceptado  
> **Fecha**: 2026-11-15  
> **Autor**: Senior Backend Architect  

---

## Contexto y Problema
La plataforma *Vocabulary App* requiere una arquitectura backend escalable, tipada fuertemente de extremo a extremo con TypeScript y modularizada para albergar dominios diferenciados:
- Criptografía asimétrica y autenticación passwordless (Passkeys / WebAuthn).
- Motor de Repetición Espaciada Implícita (algoritmos basados en grafos de palabras y oraciones).
- Servicios de Almanaque, Gamificación y eventos programados (Weekly Recaps).

Se evaluaron dos alternativas principales en el ecosistema Node.js / TypeScript: **Fastify puro** vs. **NestJS** (con Fastify adapter).

---

## Decisión
Se adopta **NestJS** como framework oficial para el backend, configurado sobre el runtime de **Node.js** con **TypeScript**.

### Stack Confirmado:
1. **Framework Principal**: NestJS (Arquitectura modular por controladores, servicios, repositorios e inyección de dependencias).
2. **Motor HTTP Subyacente**: `@nestjs/platform-fastify` para maximizar el throughput y minimizar la latencia I/O en endpoints de alta frecuencia.
3. **Persistencia & ORM**: PostgreSQL + Prisma ORM.
4. **Caché y Desafíos Criptográficos**: Redis (`ioredis`).

---

## Consecuencias y Beneficios

### Pros:
- **Estructura Arquitectónica Robusta**: Modularidad nativa (`AuthModule`, `LearningModule`, `AlmanacModule`, `GamificationModule`) facilitando el mantenimiento y trabajo en equipo.
- **Inyección de Dependencias (DI)**: Facilita el desacoplamiento de la lógica de negocio frente a la infraestructura y permite una suite de tests unitarios e integrados con mocks limpios.
- **Validación Declarativa**: Uso de `class-validator` y `class-transformer` mediante DTOs tipados.
- **Documentación Swagger / OpenAPI Integrada**: Generación automática de contratos para el agente de Frontend.

### Contras / Mitigaciones:
- *Curva de inicialización ligeramente mayor*: Mitigada por la estructura estándar de NestJS y generadores CLI.
