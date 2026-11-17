# 🎨 Bitácora de Implementación y Estado del Frontend — Vocabulary App

> **Fecha de Actualización**: 2026-11-15  
> **Estado**: Aplicación Autenticada Integrada con API Persistente  
> **Ubicación**: `vocabulary-app/frontend/`  

---

## 📌 1. Lo que se ha implementado hasta ahora:

1. **Configuración del Proyecto Frontend**:
   - `package.json`: Vite, React 18, TypeScript, Tailwind CSS, `@simplewebauthn/browser`, Lucide Icons, React Router y TanStack Query.
   - `vite.config.ts`: Configurado con proxy a `http://localhost:4000/api` y alias `@/*`.
   - `tailwind.config.js` y `postcss.config.js`: Paleta personalizada (`brand`, `almanac` con estados `discovered`, `consolidating`, `mastered`), y soporte para target táctil accesible (`min-w-touch: 44px`).
   - `tsconfig.json`: TypeScript moderno para bundler con alias de importación.
2. **Capa de Accesibilidad y Estilos**:
   - `src/index.css`: Directivas Tailwind, soporte estricto a `@media (prefers-reduced-motion)` y anillos de foco visibles obligatorios (`:focus-visible`).
3. **Tipos e Interfaces**:
   - `src/types/index.ts`: Modelos completos alineados a los contratos del Backend (`User`, `Word`, `ContextSentence`, `AlmanacWordItem`, `WordState`).
4. **Componentes Clave Construidos**:
   - `AudioPlayerButton.tsx`: Botón accesible para reproducir pronunciación nativa con feedback de error y animación de ondas auditivas.
   - `AlmanacCard.tsx`: Tarjeta interactiva tipo cromo coleccionable con badges de estado (`Descubierta`, `En Consolidación`, `Dominada`), soporte por teclado (`Enter`, `Space`) e imagen inequívoca.
   - `App.tsx`: Layout principal con navbar, contador de rachas con animación de fuego, banner de bienvenida y modal accesible de ficha detallada con reproducción de audio.
5. **Primer Flujo Vertical (`/learn`)**:
   - Sesión de tres palabras con cuatro opciones, feedback no punitivo y reencolado único tras un error.
   - El cliente envía `selectedOptionId` y un `attemptId` idempotente; no autodeclara si acertó.
   - Controles nativos, anuncios `aria-live`, targets táctiles de 44px, skip link y gestión de foco posterior al acierto.
   - Resultado correcto con término, IPA, traducción y oración contextual; final de sesión con resumen.
   - Cliente HTTP aislado en `src/features/learning/learningApi.ts`, conectado a los endpoints reales de `MVP-001`.
6. **Autenticación y Almanaque Real**:
   - Pantalla de registro/login Passkey con control de sesión y cierre de sesión.
   - Dashboard por categorías, Almanaque con búsqueda/filtros/paginación y ficha detallada con re-juego.
   - Imágenes y pronunciaciones locales para 12 palabras en tecnología, oficina y frutas.

---

## 📌 2. Cómo ejecutar el Frontend localmente:

Con Bun instalado en tu sistema:
```bash
cd frontend
bun install
bun run dev
```
La aplicación abrirá en `http://localhost:3000`.

---

## 📌 3. Próximos pasos a seguir para continuar:

1. **Siguientes incrementos de producto**:
   - Diagnóstico inicial, fallback OAuth/Magic Link, logros y recapitulación semanal.
