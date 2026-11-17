# 📋 Documento de Requerimientos del Sistema (SRS) — Vocabulary App

> **Versión**: 1.0 — Especificación Consolidada de Negocio  
> **Fecha**: 2026-11-15  
> **Rol**: Analista de Requerimientos (Senior Requirements Analyst)  
> **Destinatarios**: Frontend Architect, Backend Architect  

---

## 1. Visión Ejecutiva del Producto
Plataforma web gamificada, reactiva y visual, centrada en la **adquisición y retención a largo plazo de vocabulario en inglés** sin sobrecarga gramatical teórica. 
A través de **aprendizaje inductivo-visual**, el usuario deduce significados, afianza pronunciación nativa y construye una colección viva en su **Almanaque de Palabras**, respaldado por un motor inteligente de **Repetición Espaciada Implícita (in-context reinforcement)** y autenticación moderna sin contraseñas (**Passkeys**).

---

## 2. Requerimientos Funcionales (RF)

### Módulo 1: Autenticación y Onboarding
- **RF-001 [Autenticación Obligatoria Passwordless con Passkeys]**:
  - Registro e inicio de sesión mandatorio antes de la experiencia principal para garantizar persistencia continua de datos, progreso y coleccionables.
  - Soporte nativo prioritario de **Passkeys (WebAuthn / FIDO2)** (biometría / PIN de dispositivo).
  - Respaldo (fallback) estándar para dispositivos no compatibles: inicio de sesión social (OAuth) o Magic Link vía email.
- **RF-002 [Diagnóstico Inicial Objetivo (Placement Assessment)]**:
  - Evaluación interactiva inmediata posterior al registro.
  - Basada en estímulos visuales y de comprensión léxica para determinar objetivamente el nivel base sin depender de autodeclaraciones propensas a sesgos.

### Módulo 2: Motor de Aprendizaje y Presentación
- **RF-003 [Adquisición Visual Inequívoca]**: Presentación de términos mediante imágenes de alta fidelidad semántica que permitan deducir el concepto antes de recurrir a la traducción.
- **RF-004 [Soporte Fonético y Contextual]**:
  - Pronunciación nativa en audio de alta calidad bajo demanda.
  - Transcripción fonética legible.
  - Oración de ejemplo real que ponga en contexto el término aprendido.
  - Traducción al español como elemento secundario y de soporte.
- **RF-005 [Adaptación Dinámica por Nivel]**: El motor calibra la dificultad intrínseca de los términos entregados dentro de cualquier categoría según el desempeño y el nivel del usuario.

### Módulo 3: El Almanaque y Retención Espaciada Implícita
- **RF-006 [Estados de Vida de la Palabra]**:
  - Toda palabra descubierta transiciona a través de estados: `Descubierta` ➔ `En Consolidación` ➔ `Dominada`.
- **RF-007 [Repetición Espaciada Implícita (In-Context Spaced Repetition)]**:
  - En lugar de pruebas de repetición mecánicas y aisladas, el sistema inyecta palabras pendientes de repaso dentro de las oraciones de ejemplo y pistas de las nuevas palabras que el usuario está aprendiendo.
  - Se evalúa de manera orgánica si el usuario comprende los términos previos dentro de nuevos contextos.
- **RF-008 [Ficha Detallada del Almanaque]**:
  - Identidad léxica y visual (palabra en inglés, imagen representativa, traducción).
  - Transcripción fonética y reproducción de audio nativo.
  - Oración de ejemplo vinculada con palabras del propio almanaque.
  - Metadatos: fecha de adquisición, estado de maestría actual y botón de re-juego interactivo.
- **RF-009 [Recapitulación Semanal (Weekly Recap)]**:
  - Resumen visual cada 7 días con las palabras descubiertas y practicadas en la semana, sirviendo de refuerzo e invitación al repaso de términos débiles.

### Módulo 4: Exploración y Gamificación Positiva
- **RF-010 [Catálogo de Categorías Abierto]**: Acceso irrestricto a todas las categorías (tecnología, oficina, frutas, verbos, etc.) desde el día 1.
- **RF-011 [Ruta Recomendada Post-Diagnóstico]**: Sugerencia visual en la UI de categorías iniciales óptimas según el test diagnóstico, sin bloquear las demás.
- **RF-012 [Gamificación No Punitiva]**:
  - Cero vidas/corazones perdidos: los errores son formativos y no impiden seguir practicando.
  - **Rachas de actividad (Streaks)**: Conteo diario consecutivo.
  - **Vitrina de Medallas y Logros**: Insignias por hitos (100% de categoría, hitos de volumen acumulado, rachas prolongadas, retos semanales).

---

## 3. Matriz de Requerimientos No Funcionales (RNF)

| ID | Categoría | Requerimiento | Criterio de Aceptación / Métrica |
|---|---|---|---|
| **RNF-001** | **Seguridad** | Autenticación WebAuthn / Passkeys | Cumplimiento del estándar W3C WebAuthn Nivel 2/3. Fallback seguro sin almacenamiento de contraseñas en texto plano. |
| **RNF-002** | **Rendimiento Multimedia** | Carga de imágenes y audios | Latencia de inicio de reproducción de audio < 150ms. Imágenes optimizadas (WebP/AVIF) con precarga (prefetching) de la siguiente palabra. |
| **RNF-003** | **Responsividad y Fluidez** | Experiencia UI móvil y desktop | 100% adaptativo (Mobile-First), transiciones a 60 FPS, layout optimizado para interacción táctil rápida. |
| **RNF-004** | **Persistencia y Resiliencia** | Sincronización de progreso | Guardado transaccional inmediato de cada interacción para que el usuario no pierda rachas ni estados ante desconexiones. |

---

## 4. Matriz de Handoff Técnico

### 🎨 Para el Arquitecto de Diseño Frontend:
1. **Flujo de Autenticación Moderno**: Diseñar interfaz con llamada directa a la API WebAuthn (Passkey prompt de Android/iOS/Windows Hello/macOS TouchID) y vista de respaldo (OAuth / Magic Link).
2. **UI del Almanaque (Álbum Coleccionable)**: Vista tipo cuadrícula de cartas/cromos coleccionables con estados visuales (`Descubierta`, `En Consolidación`, `Dominada`), filtros por categoría y modal de ficha detallada con audio.
3. **Mecánica In-Game**: Pantalla limpia, enfocada en la imagen principal y audio, micro-animaciones positivas ante aciertos y corrección amigable en fallos (sin banners rojos agresivos de derrota).
4. **Dashboard y Vitrina**: Visualización de racha actual, medallas desbloqueadas y banner de *Weekly Recap*.

### ⚙️ Para el Arquitecto de Diseño Backend:
1. **Módulo de Identidad**: Endpoints WebAuthn (Challenge generation, credential registration, credential assertion) + proveedor OAuth / Magic link tokenizado.
2. **Grafo de Vocabulario y Contextos**: Modelo de datos capaz de vincular palabras con oraciones de ejemplo que reutilicen palabras del usuario (base para la repetición espaciada implícita).
3. **Motor de Adaptación y Retención**:
   - Algoritmo de calibración de dificultad según ratio de aciertos.
   - Scheduler o generador dinámico de eventos de *Weekly Recap* y cálculo de rachas diarias con normalización de zonas horarias.
4. **Almacenamiento de Assets**: CDN para entrega ultrarrápida de audios (MP3/Opus) e imágenes comprimidas sin pérdida semántica.
