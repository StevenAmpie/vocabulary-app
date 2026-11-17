# 📡 Especificación de Contratos de API RESTful — Vocabulary App

> **Versión**: 1.0  
> **Prefijo Base**: `/api/v1`  
> **Ecosistema**: NestJS Swagger / OpenAPI 3.0  
> **Destinatarios**: Frontend Architect, Backend Engineering Team  

---

## 1. Módulo de Autenticación (`AuthModule`)

### 1.1 `POST /auth/passkey/register-options`
Genera el desafío criptográfico para registrar una nueva Passkey.
- **Auth**: No requerida.
- **Request Body (DTO)**:
  ```json
  {
    "email": "user@example.com",
    "displayName": "Alex Dev"
  }
  ```
- **Response `200 OK`**: Objeto `PublicKeyCredentialCreationOptionsJSON` (desafío en Base64URL, rpId, timeout, etc.).
- **Errores**: `400 BAD_REQUEST`, `429 TOO_MANY_REQUESTS`.

### 1.2 `POST /auth/passkey/verify-registration`
Verifica la firma y almacena la clave pública de la Passkey en base de datos.
- **Request Body (DTO)**:
  ```json
  {
    "email": "user@example.com",
    "registrationResponse": { /* RegistrationResponseJSON estándar WebAuthn */ }
  }
  ```
- **Response `201 CREATED`**:
  - Headers: `Set-Cookie: session_token=...; HttpOnly; Secure; SameSite=Strict`
  - Body:
    ```json
    {
      "user": {
        "id": "uuid-v4",
        "email": "user@example.com",
        "displayName": "Alex Dev",
        "hasCompletedDiagnostic": false
      }
    }
    ```

### 1.3 `POST /auth/passkey/login-options`
Genera las opciones de solicitud para login con Passkey (soporta Conditional UI / Autofill).
- **Request Body (DTO)**:
  ```json
  {
    "email": "user@example.com" // Opcional si el navegador utiliza autofill/userHandle
  }
  ```
- **Response `200 OK`**: Objeto `PublicKeyCredentialRequestOptionsJSON`.

### 1.4 `POST /auth/passkey/verify-login`
Verifica la firma biométrica de login y autentica al usuario.
- **Response `200 OK`**: Set-Cookie de sesión + datos del usuario.

### 1.5 `GET /auth/oauth/google` & `GET /auth/oauth/google/callback`
Endpoints estándar OAuth2 para inicio de sesión social de respaldo.

### 1.6 `POST /auth/logout`
Revoca la sesión en Redis y limpia la cookie de sesión (`Max-Age=0`).

---

## 2. Módulo de Diagnóstico y Aprendizaje (`LearningModule`)

### 2.1 `POST /learning/diagnostic/submit`
Envía los resultados del test interactivo inicial para calibrar el nivel base del usuario.
- **Auth**: Requerida (Cookie de sesión).
- **Request Body (DTO)**:
  ```json
  {
    "answers": [
      { "wordId": "uuid-word-1", "isCorrect": true, "responseTimeMs": 1420 },
      { "wordId": "uuid-word-2", "isCorrect": false, "responseTimeMs": 3100 }
    ]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "assignedLevel": "A2",
    "recommendedCategories": ["office", "technology", "daily-routine"]
  }
  ```

### 2.2 `POST /learning/sessions`
Crea una sesión de aprendizaje y su cola inicial de palabras.
- **Auth**: Requerida.
- **Request Body (DTO)**:
  ```json
  {
    "categorySlug": "technology",
    "targetWordCount": 10
  }
  ```
- **Response `201 CREATED`**:
  ```json
  {
    "sessionId": "uuid-session",
    "total": 10,
    "remaining": 10
  }
  ```

### 2.3 `GET /learning/sessions/:sessionId/next`
Obtiene el reto actual sin avanzar la cola y sin revelar la respuesta.
- **Auth**: Requerida. La sesión debe pertenecer al usuario autenticado.
- **Response `200 OK`**:
  ```json
  {
    "exercise": {
      "id": "uuid-exercise",
      "prompt": "¿Qué término representa esta imagen?",
      "imageUrl": "https://cdn.vocabapp.com/images/words/keyboard.webp",
      "audioUrl": "https://cdn.vocabapp.com/audio/words/keyboard.mp3",
      "options": [
        { "id": "uuid-word-10", "label": "Keyboard" },
        { "id": "uuid-word-11", "label": "Monitor" },
        { "id": "uuid-word-12", "label": "Mouse" },
        { "id": "uuid-word-13", "label": "Headphones" }
      ]
    },
    "session": {
      "position": 1,
      "total": 10
    }
  }
  ```

### 2.4 `PUT /learning/sessions/:sessionId/attempts/:attemptId`
Registra una selección de forma idempotente. El servidor determina si es correcta; el cliente nunca envía `isSuccess`.
- **Request Body (DTO)**:
  ```json
  {
    "exerciseId": "uuid-exercise",
    "selectedOptionId": "uuid-word-10",
    "responseTimeMs": 1420
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "correct": true,
    "shouldRequeue": false,
    "reveal": {
      "word": {
        "id": "uuid-word-10",
        "termEn": "Keyboard",
        "translationEs": "Teclado",
        "phoneticIpa": "/ˈkiː.bɔːrd/",
        "audioUrl": "https://cdn.vocabapp.com/audio/words/keyboard.mp3"
      },
      "contextSentence": {
        "sentenceEn": "She spilled coffee over her keyboard and ruined her screen.",
        "translationEs": "Ella derramó café sobre su teclado y arruinó su pantalla."
      }
    },
    "progress": {
      "previousState": null,
      "state": "DISCOVERED",
      "directSuccessCount": 1
    },
    "streak": {
      "days": 5,
      "maintainedToday": true
    }
  }
  ```

Repetir el mismo `attemptId` devuelve el resultado almacenado sin volver a incrementar contadores. Una respuesta incorrecta se registra sin crear progreso `DISCOVERED` y agrega la palabra una sola vez al final de la cola.

---

## 3. Módulo de Almanaque y Colección (`AlmanacModule`)

### 3.1 `GET /almanac/words`
Obtiene las palabras coleccionadas por el usuario con filtros y paginación.
- **Auth**: Requerida.
- **Query Params**: `?state=DISCOVERED&category=technology&page=1&limit=24`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "uuid-word-10",
        "termEn": "Keyboard",
        "translationEs": "Teclado",
        "phoneticIpa": "/ˈkiː.bɔːrd/",
        "imageUrl": "https://cdn.vocabapp.com/images/words/keyboard.webp",
        "audioUrl": "https://cdn.vocabapp.com/audio/words/keyboard.mp3",
        "state": "DISCOVERED",
        "discoveredAt": "2026-11-15T19:00:00Z",
        "masteryPercentage": 35
      }
    ],
    "meta": {
      "totalWords": 42,
      "discoveredCount": 25,
      "consolidatingCount": 12,
      "masteredCount": 5,
      "page": 1,
      "totalPages": 2
    }
  }
  ```

### 3.2 `GET /almanac/words/:id`
Ficha completa e individual de una palabra con su historial y oración contextual para volver a jugar o repasar bajo demanda.

---

## 4. Módulo de Gamificación y Eventos (`GamificationModule`)

### 4.1 `GET /gamification/profile`
Obtiene el estado de la racha actual, medallas desbloqueadas y estadísticas globales.

### 4.2 `GET /gamification/weekly-recap/latest`
Obtiene el último resumen semanal generado para el usuario (palabras aprendidas, tiempo de estudio y llamado a la acción).

---

## 5. Formato Unificado de Errores

Todas las respuestas de error siguen el estándar RFC 7807 (`application/problem+json`):
```json
{
  "type": "https://vocabapp.example/problems/webauthn-challenge-expired",
  "title": "WebAuthn challenge expired",
  "status": 400,
  "detail": "The cryptographic challenge has expired. Please try again.",
  "instance": "/api/v1/auth/passkey/verify-login",
  "errorCode": "WEBAUTHN_CHALLENGE_EXPIRED",
  "requestId": "req-uuid"
}
```
