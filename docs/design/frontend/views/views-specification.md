# 🖼️ Especificación de Vistas y Wireframes Textuales — Vocabulary App

---

## 1. Vista de Autenticación (`AuthView` — `/auth`)

### Wireframe Textual
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                     [ ✨ Logo VocabApp ]               │
│               Aprende inglés de forma visual           │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │                                                │   │
│   │   [ 🔑 Entrar o Registrarse con Passkey ]      │   │
│   │   (Un toque con tu huella, rostro o PIN)       │   │
│   │                                                │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│   ────────────────── o continúa con ─────────────────  │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │   [ G ] Continuar con Google                   │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│   🔒 Seguro, sin contraseñas que recordar.             │
└────────────────────────────────────────────────────────┘
```
- **Interacción**: Al cargar la página, el navegador ejecuta `navigator.credentials.get({ mediation: 'conditional' })`. Si el usuario ya tiene Passkey registrada en el dispositivo, aparece el selector nativo automáticamente (Autofill).

---

## 2. Vista de Aprendizaje / Deducción Visual (`StudySessionView` — `/learn/:category?`)

### Wireframe Textual
```
┌────────────────────────────────────────────────────────┐
│ [← Salir]       Tecnología • Palabra 3/10      [🔥 5]  │
│ ━━━━━━━━━━━━━━━━━━━━━╺━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
├────────────────────────────────────────────────────────┤
│                                                        │
│           ┌────────────────────────────────┐           │
│           │                                │           │
│           │                                │           │
│           │       [ IMAGEN INEQUÍVOCA ]    │           │
│           │       (ej. Foto de un Teclado) │           │
│           │                                │           │
│           │                                │           │
│           └────────────────────────────────┘           │
│                                                        │
│                     [ 🔊 Escuchar Audio ]              │
│                                                        │
│       ¿Qué término en inglés representa esta imagen?    │
│                                                        │
│   ┌──────────────────────┐  ┌──────────────────────┐   │
│   │   A) Keyboard        │  │   B) Monitor         │   │
│   ├──────────────────────┤  ├──────────────────────┤   │
│   │   C) Mouse           │  │   D) Headset         │   │
│   └──────────────────────┘  └──────────────────────┘   │
│                                                        │
├────────────────────────────────────────────────────────┤
│ (Post-Acierto):                                        │
│  ✨ ¡Correcto! Keyboard /ˈkiː.bɔːrd/                   │
│  💬 "She spilled coffee over her keyboard and          │
│      ruined her [screen]."                             │
│  [ Siguiente Palabra ➔ ]                               │
└────────────────────────────────────────────────────────┘
```
- **Detalle Clave**: Al acertar, se desbloquea la oración de contexto. La palabra `screen` aparece resaltada porque es una palabra previa inyectada para el **repaso espaciado implícito**.

---

## 3. Vista del Almanaque / Álbum Coleccionable (`AlmanacView` — `/almanac`)

### Wireframe Textual
```
┌────────────────────────────────────────────────────────┐
│ [Logo]  Almanaque de Palabras      [🔍 Buscar] [👤 Perfil]│
├────────────────────────────────────────────────────────┤
│  Coleccionadas: 42 palabras   •   [🏆 Ver Medallas]    │
│                                                        │
│  [ Todas (42) ] [ Descubiertas (25) ] [ Dominadas (5) ]│
│  Filtro Categoría: [ Tecnología ▾ ]                    │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 🖼️ Foto      │  │ 🖼️ Foto      │  │ 🔒 ?         │  │
│  │              │  │              │  │              │  │
│  │ Keyboard     │  │ Screen       │  │ (Por descubrir)│ │
│  │ /teclado/    │  │ /pantalla/   │  │              │  │
│  │ 🟢 Dominada  │  │ 🟡 Consolidan│  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                        │
│  [ Paginación: 1 de 2 ]                                │
└────────────────────────────────────────────────────────┘
```
- **Interacción**: Al hacer clic en cualquier cromo/tarjeta del Almanaque, se abre el modal con la ficha completa y el botón **[ Volver a Jugar ]**.
