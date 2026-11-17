# 🧩 Catálogo de Componentes de UI y Criterios de Accesibilidad (a11y)

> **Estándar**: WCAG 2.2 Nivel AA  
> **Patrón**: Atomic Design (Átomos, Moléculas, Organismos)  

---

## 1. Componentes Clave

### 1.1 `AudioPlayerButton` (Molécula)
- **Propósito**: Botón de reproducción de pronunciación nativa con feedback háptico/visual.
- **Props**:
  - `audioUrl: string` (Ruta CDN).
  - `label?: string` (Default: "Escuchar pronunciación").
  - `size?: 'sm' | 'md' | 'lg'`.
- **Accesibilidad (a11y)**:
  - `aria-label="Escuchar pronunciación de [Palabra]"`
  - Soporte de teclado: Activable con `Space` o `Enter`.
  - Icono animado de ondas sonoras que respeta `@media (prefers-reduced-motion)`.

### 1.2 `AlmanacCard` (Molécula / Cromo Coleccionable)
- **Propósito**: Tarjeta individual de la cuadrícula del Almanaque.
- **Props**:
  - `word: WordDTO`
  - `state: 'DISCOVERED' | 'CONSOLIDATING' | 'MASTERED'`
  - `onClick: () => void`
- **Accesibilidad (a11y)**:
  - Elemento semántico: `<article role="button" tabIndex={0}>`.
  - `aria-haspopup="dialog"` (informa que abre la ficha detallada).
  - Borde con contraste mínimo 3:1 y badges de estado identificados por color y texto para personas con daltonismo (no depender exclusivamente del color verde/amarillo).

### 1.3 `VisualDeductionPanel` (Organismo)
- **Propósito**: Componente central del juego de aprendizaje.
- **Elementos**:
  - Imagen inequívoca con `alt` descriptivo funcional (sin desvelar la respuesta antes de interactuar).
  - Grupo de opciones de selección accesible (`role="radiogroup"` o botones individuales con `aria-pressed`).
  - Región `aria-live="polite"` para anunciar a los lectores de pantalla si la respuesta fue correcta sin interrumpir el foco.

---

## 2. Checklist de Accesibilidad Universal (WCAG 2.2 AA)

| Criterio | Especificación en Vocabulary App |
|---|---|
| **1.4.3 Contraste Mínimo** | Texto regular ≥ 4.5:1; textos grandes e iconos interactivos ≥ 3:1 contra el fondo. |
| **2.1.1 Teclado** | 100% de la aplicación operable sin ratón (`Tab`, `Shift+Tab`, flechas para opciones, `Esc` para modales). |
| **2.4.7 Foco Visible** | Anillos de foco destacados con `outline: 2px solid #3b82f6` y offset de 2px; nunca ocultar `:focus-visible`. |
| **2.5.8 Área de Destino Mínima** | Todos los botones interactivos (audio, tarjetas de selección) tienen al menos **44 x 44 píxeles** de target. |
| **2.2.2 Pausa y Animaciones** | Respeto a `prefers-reduced-motion: reduce` desactivando partículas y transiciones complejas. |
