# MVP-001 — Sesión vertical de aprendizaje

> Estado: Implementado y verificado  
> Fecha: 2026-11-15  
> Requisitos: RF-003, RF-004, RF-006, parte de RF-007 y RF-012; RN-002, RN-004

## Objetivo

Permitir que un usuario autenticado reciba un reto visual, elija una respuesta,
obtenga retroalimentación no punitiva y registre el resultado de manera
idempotente.

## Decisiones del incremento

- El cliente envía `selectedOptionId`; nunca declara `isSuccess`.
- La respuesta correcta, traducción, IPA y oración contextual no se exponen
  antes de responder.
- Cada intento usa un `attemptId` UUID generado por el cliente.
- Un error se registra, no degrada el progreso y reencola la palabra una sola
  vez al final de la sesión.
- El primer acierto crea el estado `DISCOVERED`. Las reglas para
  `CONSOLIDATING` y `MASTERED` quedan pendientes de definición.
- La interacción contextual todavía no incrementa `contextSuccessCount`, pues
  este incremento solo presenta la oración y no evalúa su comprensión.

## Contrato objetivo

### `POST /api/v1/learning/sessions`

Crea una sesión asociada al usuario y una cola pequeña de palabras.

### `GET /api/v1/learning/sessions/:sessionId/next`

Devuelve el reto actual sin revelar la respuesta:

```json
{
  "exercise": {
    "id": "uuid",
    "prompt": "¿Qué término representa esta imagen?",
    "imageUrl": "https://cdn.example/image.webp",
    "audioUrl": "https://cdn.example/audio.mp3",
    "options": [{ "id": "word-uuid", "label": "Keyboard" }]
  },
  "session": { "position": 1, "total": 10 }
}
```

### `PUT /api/v1/learning/sessions/:sessionId/attempts/:attemptId`

```json
{
  "exerciseId": "uuid",
  "selectedOptionId": "word-uuid",
  "responseTimeMs": 1420
}
```

El servidor valida la respuesta y devuelve `correct`, `shouldRequeue`, el
contenido revelado cuando corresponda, progreso y estado de la racha.

## Implementación actual

- El frontend dispone de `/learn`, consume `/api/v1/learning` mediante HTTP y
  conserva controles nativos, anuncios accesibles, feedback sin castigo,
  reencolado y final de sesión.
- `LearningModule` implementa creación y propiedad de sesión, reto sin fuga de
  respuesta, validación de selección, reencolado único e idempotencia global por
  `attemptId`.
- Las sesiones se almacenan en Redis con expiración y propiedad por usuario.
- Los intentos, progreso y racha se guardan en una transacción Prisma; repetir un
  `attemptId` devuelve el resultado persistido sin duplicar contadores.
- La identidad procede de una sesión Passkey respaldada por una cookie firmada
  `HttpOnly`; ya no existe identidad provisional por cabecera.
- La compilación de ambos proyectos, las pruebas de servicio/controlador y una
  comprobación HTTP del servidor completo se verificaron el 2026-11-15.

## Fuera de alcance

- Passkeys/OAuth y guardia de sesión real.
- Redis y expiración de sesiones.
- Algoritmo definitivo de repetición espaciada y maestría.
- Persistencia offline entre recargas.
- Diagnóstico, logros y recapitulación semanal.
