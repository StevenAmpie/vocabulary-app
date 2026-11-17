# 📜 Reglas de Negocio Oficiales — Vocabulary App

## RN-001: Autenticación Passwordless y Persistencia
- **Regla**: El acceso y registro en la plataforma se realiza mediante **Passkeys (FIDO2/WebAuthn)**.
- **Excepción/Fallback**: Si el dispositivo del usuario no posee autenticador compatible (sin biometría o soporte FIDO2), se habilita un canal alternativo seguro (OAuth social o Magic Link por correo).
- **Efecto**: Todo evento de aprendizaje, diagnóstico y recolección queda vinculado a la cuenta persistida de inmediato.

## RN-002: Gamificación Positiva (No Castigo)
- **Regla**: No existen mecanismos que bloqueen o restrinjan el tiempo de aprendizaje (sin pérdida de vidas, tiempos de espera forzados ni penalizaciones destructivas).
- **Efecto de Error**: Ante un fallo en una interacción, se expone retroalimentación inmediata (auditiva/visual) y la palabra se re-encola en la misma sesión para afianzar el aprendizaje sin frustración.

## RN-003: Acceso Abierto a Categorías y Guía No Punitiva
- **Regla**: Todas las categorías están abiertas desde el momento cero.
- **Guía**: El sistema destaca mediante etiquetas/señalizaciones visuales ("Recomendado para ti") aquellas categorías y niveles arrojados por el test diagnóstico inicial, dejando al usuario la libertad de saltar a cualquier otra.

## RN-004: Ciclo de Vida del Término en el Almanaque
- **Estados**:
  1. `Descubierta`: La palabra ha sido completada con éxito en su primera interacción.
  2. `En Consolidación`: La palabra ha sido comprendida al menos en 2-3 ocasiones posteriores (directas o implícitas).
  3. `Dominada`: La palabra ha sido validada exitosamente a través de múltiples revisiones espaciadas en el tiempo.
- **Acción en Almanaque**: Cualquier palabra puede ser inspeccionada y re-jugada en cualquier momento desde su ficha.

## RN-005: Repetición Espaciada Implícita (In-Context)
- **Regla**: Las palabras con fecha de repaso programada no se evalúan únicamente de manera aislada.
- **Acción**: El motor de contenido selecciona oraciones de ejemplo de palabras nuevas que contengan términos que el usuario debe reforzar, evaluando su comprensión contextual en un entorno de aprendizaje natural.

## RN-006: Recapitulación Semanal (Weekly Recap)
- **Regla**: Al cumplirse una ventana de 7 días naturales, se consolida un reporte visual del progreso (palabras adquiridas, tasa de consolidación, racha semanal).
- **Acción**: Se genera un llamado a la acción para celebrar los logros y reforzar términos que se encuentren en estado de consolidación.
