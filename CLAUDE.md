# Bağyt React SPA

React 18 + Vite frontend for **Panacea**, a three-tier medical consultation system:

- **Laravel API** (this frontend talks to it): `c:\xampp\htdocs\panacea\` — dev server at `http://localhost:8000/api`.
- **Python FastAPI ai-service**: `c:\xampp\htdocs\ai-service\` — owned by teammates. Not consumed directly by this SPA; Laravel proxies AI calls.
- **Swift iOS app**: separate repo, consumes the same Laravel API.

Laravel is API-only (no Blade views). Auth is Sanctum Bearer tokens. Roles/permissions via Spatie `laravel-permission` (`admin`, `user`; `chat.*` and `anamnesis.*` permissions). A new user gets the `user` role on registration automatically.

## Stack

- React 18 + JSX (no TypeScript), Vite 7
- Routing: react-router-dom v6 (`createBrowserRouter`)
- State: plain React Context (`src/context/AuthContext.jsx`). **No React Query, no Redux.** Keep it that way — this is a diploma project, not an enterprise app.
- HTTP: **axios** via `src/api/axios-client.js`. Interceptor auto-attaches `Bearer <token>` from `localStorage.token`. Base URL comes from `VITE_API_URL`.
- Styling: Tailwind with custom palette (`brand-*`, `deep-*`) and utility classes (`bg-grad-pill`, `shadow-pill`, `bg-grad-cta-deep`). Dark mode via `dark:` variants.
- i18n: react-i18next, 3 locales inline in [src/i18n.js](src/i18n.js) (en, ru, kk).
- Icons: lucide-react. Animation: framer-motion.

Env var required in `.env.local`:
```
VITE_API_URL=http://localhost:8000/api
```

## Backend API contract

All endpoints return JSON. Send `Accept: application/json` (axios-client does this). Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/register` | `{name, email, sex, age, password, password_confirmation}` | `{message, user, roles, permissions, token, token_type, expires_in}` |
| POST | `/login` | `{email, password}` | `{user, roles, permissions, token, token_type, expires_in}` |
| GET | `/user` | — | `{user, roles, permissions}` |
| POST | `/logout` | — | `{message}` |
| GET | `/tokens` | — | `{tokens: [...]}` |
| POST | `/tokens` | `{device_name}` | `{token, token_type}` |
| DELETE | `/tokens/{id}` | — | `{message}` |

`roles` is an array of role-name strings (e.g. `["user"]`). `permissions` is an array of permission-name strings (e.g. `["chat.create","chat.read",...]`).

### Chats

| Method | Path | Body / Query | Notes |
|---|---|---|---|
| GET | `/chats?q=&page=&per_page=` | — | Paginated. Searches title + message content. |
| POST | `/chats` | `{title?}` | Creates empty chat. |
| GET | `/chats/{id}?page=&per_page=` | — | Includes paginated `messages`. |
| PATCH | `/chats/{id}` | `{title}` | Renames chat. |
| DELETE | `/chats/{id}` | — | Cascades messages + anamneses. |
| POST | `/chats/{id}/messages` | `{message}` | **Sync**. Returns `{user_message, assistant_message}` after AI responds (5–15s). |
| POST | `/chats/{id}/messages/stream` | `{message}` | **SSE stream**. See below. |
| POST | `/chats/{id}/regenerate` | — | Deletes last assistant message, re-calls AI. Returns `{assistant_message}`. |
| PATCH | `/chats/{id}/messages/{messageId}` | `{message}` | Edits user message, deletes all later messages, generates fresh AI reply. |
| DELETE | `/chats/{id}/messages/{messageId}` | — | Removes single message. |

### SSE stream event sequence

The stream endpoint emits Server-Sent Events. Events arrive as:
```
event: meta
data: {"conversation_id":"..."}

event: delta
data: {"text":"Hello"}

event: delta
data: {"text":" world"}

event: final
data: {"answer":"Hello world","conversation_id":"..."}

event: saved
data: {"user_message_id":123,"assistant_message_id":124}
```

An `event: error` with `{error: "..."}` can fire at any point. Always handle it.

**Client-side:** use `fetch` + `ReadableStream` (NOT `EventSource` — it can't POST a body and can't set the Authorization header). A ready-to-use helper lives at `src/api/sseStream.js`.

### Anamneses

An anamnesis is an AI-generated structured medical history extracted from a chat. 8 fields:
`chief_complaint, history_present_illness, past_medical_history, family_history, social_history, allergies, medications, review_of_systems`.

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/anamneses?page=&per_page=` | — | Paginated. |
| GET | `/anamneses/{id}` | — | Single. |
| PATCH | `/anamneses/{id}` | `{chief_complaint?, ...}` | Manual edit after AI generation. |
| DELETE | `/anamneses/{id}` | — | — |
| POST | `/chats/{chatId}/anamnesis` | — | **Generates new anamnesis from chat**. Takes 5–30s. Returns full anamnesis record. |

If the AI fails to emit valid JSON, structured fields will be null and `ai_raw_response.raw_text` will contain the fallback prose. UI should gracefully show either.

## Permissions

The `user` role has all 8 `chat.*` / `anamnesis.*` permissions, scoped to their own records in the backend (foreign-user access returns **404**, not 403 — don't rely on 403 to detect cross-user reads). Admin role exists for the seeded `admin@panacea.local / adminpass` account but the SPA doesn't currently expose admin-specific UI.

Frontend should read `permissions` from AuthContext to conditionally render actions (e.g. only show "Delete" if `chat.delete` is present). In practice, every registered user has all user-scoped permissions, so this is mostly future-proofing.

## Known gotchas

- Don't use `EventSource` for the SSE stream — it doesn't support POST body or Authorization header. Use fetch + ReadableStream (see `src/api/sseStream.js`).
- Don't send `Accept: text/event-stream` on the stream request unless you also handle the fact that axios will not parse the response; the helper uses raw fetch.
- Anamnesis generation is long (5–30s). Always show a loading state; don't let the user double-click.
- Cross-user read returns 404, not 403. Treat 404 on a chat/anamnesis route as "not yours or not found" — don't redirect to a generic error.
- The Laravel server must be running (`php artisan serve` in `c:\xampp\htdocs\panacea\`), and the ai-service ngrok tunnel must be up, or set `AI_USE_MOCK=true` in Laravel's `.env`.
- Legacy complaint/recommendation endpoints have been **removed**. Any code referencing `/complaints` is dead and should be deleted.
