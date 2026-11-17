# 🎯 Caso de Uso: CU-001 — Sesión Interactiva de Aprendizaje de una Palabra

| Atributo | Detalle |
|---|---|
| **ID** | CU-001 |
| **Nombre** | Aprendizaje y Deducción Visual de una Palabra |
| **Actor** | Usuario Autenticado |
| **Precondición** | El usuario ha iniciado sesión y se encuentra dentro de una categoría o flujo de estudio. |
| **Postcondición** | La palabra cambia de estado en el Almanaque (`Descubierta` o avance hacia `En Consolidación`) y se registra la actividad para la racha diaria. |

---

## Flujo Principal (Happy Path)

1. **Presentación del Estímulo Visual**: El sistema presenta una imagen nítida e inequívoca del concepto junto con una opción para escuchar la pronunciación en audio nativo.
2. **Deducción y Asociación**: El usuario interactúa para asociar el concepto (bien sea seleccionando la opción adecuada o completando el término en inglés según la mecánica activa).
3. **Refuerzo Auditivo y Fonético**: Al asociar correctamente, el sistema reproduce el audio nativo con entonación clara y despliega la transcripción fonética y la palabra escrita.
4. **Contextualización Implícita**: Se despliega una oración contextual en inglés que ilustra el uso del término (incorporando palabras previas del usuario que requieran repaso espaciado).
5. **Opción de Soporte**: Se deja disponible la traducción al español en caso de que el usuario desee validación adicional.
6. **Integración al Almanaque**: La palabra queda archivada en el Almanaque con su estado actualizado y fecha de interacción.

---

## Flujos Alternativos y Excepciones

- **2a. Error en la deducción inicial**:
  - El sistema muestra una animación amigable de reintento (sin restar vidas ni puntos de penalización).
  - Se ofrecen pistas visuales o fonéticas adicionales.
  - La palabra se re-encola para volver a aparecer hacia el final de la sesión actual hasta que el usuario la asimile con éxito.
- **3a. Fallo en reproducción de audio**:
  - Si el navegador o la conexión tiene problemas con el archivo de audio, el sistema muestra la transcripción fonética y permite reintentar la reproducción sin bloquear el avance.
