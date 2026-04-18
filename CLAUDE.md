# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on port 5173 ([vite.config.js](vite.config.js)).
- `npm run build` / `npm run preview` — production build and preview.
- `npm run test` / `npm run test:run` — Vitest (watch / single run). Global setup: [src/test/setup.js](src/test/setup.js) registers `@testing-library/jest-dom`.
- Run one test file: `npx vitest run src/test/smoke.test.jsx` (or `npx vitest run -t "pattern"` by test name).
- `npm run lint` / `npm run lint:fix` — ESLint 10 flat config ([eslint.config.js](eslint.config.js)).
- `npm run format` — Prettier ([.prettierrc](.prettierrc)).

## Environment

Copy [.env.example](.env.example) to `.env` before `npm run dev`:

- `VITE_BACKEND_URL` — Laravel root; used only for `/sanctum/csrf-cookie`.
- `VITE_API_URL` — `${VITE_BACKEND_URL}/api`; axios `baseURL`.

[src/api/axios-client.js](src/api/axios-client.js) throws on boot if `VITE_API_URL` is missing — do not silently fall back.

## Backend dependency

The frontend talks to a Laravel Sanctum backend (cookie SPA auth). App routes live under `/api/*` (`panacea/routes/api.php`); only `/sanctum/csrf-cookie` sits at the root. Nothing in this repo starts that backend — run it separately (typically Docker on `:8000`) or every request fails.

## Architecture

### Provider stack ([src/main.jsx](src/main.jsx))

`<ThemeProvider>` → `<AuthProvider>` → `<RouterProvider router={router}>`. Theme is outermost so auth-gating UI already has a resolved theme; no components should check auth outside `AuthProvider` or theme outside `ThemeProvider`.

### Routing ([src/router.jsx](src/router.jsx))

`createBrowserRouter` (data router). Two trees:

- `/admin/*` wrapped in `ProtectedRoute` → [AdminLayout](src/layouts/AdminLayout.jsx) (sidebar with [ComplaintsList](src/components/ComplaintsList.jsx) + `<Outlet />`).
- `/` wrapped in `GuestRoute` → [GuestLayout](src/components/GuestLayout.jsx) for `login` / `register`.

`ProtectedRoute` bounces unauthenticated users to `/login`; `GuestRoute` sends already-authenticated users to `/admin/dashboard`. Pages must not do their own auth checks.

Both `/admin/complaints/new` and `/admin/complaints/:id` resolve through a single route with a `ComplaintEditRoute` wrapper that sets `key={complaintId}`. The key-remount is load-bearing — it's how [ComplaintEdit](src/pages/ComplaintEdit.jsx) resets its local state cleanly without `setState` in `useEffect`.

### Auth + API layer

Every API call (including the initial `/user` probe) goes through [sanctumRequest](src/config/sanctumRequest.js):

1. [getCsrfToken](src/config/csrf.js) hits `${VITE_BACKEND_URL}/sanctum/csrf-cookie` and reads `XSRF-TOKEN`.
2. The actual request is sent via [axiosClient](src/api/axios-client.js) with `withCredentials: true` and `X-XSRF-TOKEN` set.

**Do not call `axiosClient` directly for state-changing requests** — Sanctum rejects them without the CSRF header.

[axiosClient](src/api/axios-client.js) installs a response interceptor. On 401/419 (outside the `/user`, `/login`, `/register` probes) it calls the handler registered via `registerAuthErrorHandler`. [AuthContext](src/context/AuthContext.jsx) wires that to clear `user`; `ProtectedRoute` then bounces to `/login`. New auth-sensitive flows should rely on this — don't re-check session state per-page.

[AuthContext](src/context/AuthContext.jsx) owns `user`, `login`, `register`, `logout`, `loading`. `login`/`register` read the user directly from the backend response (no extra `/user` round-trip). The context never navigates — callers do (see [Header](src/components/Header.jsx) navigating after `logout`).

### Theme ([src/context/ThemeContext.jsx](src/context/ThemeContext.jsx))

Tailwind is configured `darkMode: 'class'` ([tailwind.config.js](tailwind.config.js)). The provider stores `'light' | 'dark' | 'system'` in `localStorage['theme']` (removed when `system`), listens to `prefers-color-scheme` while in `system`, and toggles `.dark` on `<html>`.

An inline script in [index.html](index.html) `<head>` applies `.dark` **before React mounts** to prevent FOUC. Do not remove it — any change to the storage key or resolution rule must be mirrored in that script.

[ThemeToggle](src/components/ui/ThemeToggle.jsx) cycles light → dark → system. Use it anywhere, not just Header/GuestLayout.

### Error handling

User-facing errors funnel through [parseApiError](src/utils/apiError.js) — it unwraps Laravel's 422 `{errors: {field: [...]}}` to a single readable string with a fallback chain. For forms that need per-field error placement, [mapBackendErrors](src/utils/registerValidation.js) maps snake_case backend keys (e.g. `password_confirmation`) to the form's camelCase state keys and returns `{field: message}`. The Register form uses both: `mapBackendErrors` for inline rendering, `parseApiError` for the banner fallback. No `alert()` anywhere.

### Forms

The Register form ([src/pages/Register.jsx](src/pages/Register.jsx)) is the reference pattern:

- Client-side rules live in [src/utils/registerValidation.js](src/utils/registerValidation.js); `validateRegister(values)` returns `{field: message}`.
- `touched[field]` flips on blur; errors only render once the field is touched **or** after first submit. `submitted` is the trigger for the "show all errors" mode — don't replicate this with a per-field submit flag.
- Server errors from 422 are merged on top of client errors and cleared when the user edits that field.
- Password UX uses [PasswordInput](src/components/ui/PasswordInput.jsx) (show/hide toggle built on the trailing-slot of `Input`) and [PasswordStrengthMeter](src/components/ui/PasswordStrengthMeter.jsx) (heuristic: length + character-class variety, 0–4 score).

### Shared UI ([src/components/ui/](src/components/ui/))

`Input`, `Select`, `Button`, `ErrorBanner`, `PasswordInput`, `PasswordStrengthMeter`, `ThemeToggle`. They handle `htmlFor`/`id` wiring via `useId`, `aria-invalid`, `aria-describedby`, focus rings, and dark-mode variants. New forms should compose these rather than re-applying Tailwind utilities inline.

### Domain model

Complaints CRUD with AI recommendations:

- List/create/delete: [ComplaintsList](src/components/ComplaintsList.jsx), always rendered in the admin sidebar.
- Detail/edit: [ComplaintEdit](src/pages/ComplaintEdit.jsx) at `/admin/complaints/:complaintId` (including `new`). After POST it reads `data.complaint.id` from the backend and navigates to the new row.
- AI analysis: [ComplaintAIAnalysis](src/components/ComplaintAIAnalysis.jsx) POSTs `/complaints/analyze` with `complaint_id` and reads `latest_recommendation` from the complaint payload to show cached results.

`GET /complaints` returns a Laravel paginator nested as `{complaints: {data: [...]}}`. `ComplaintsList.fetchComplaints` handles that shape, a flat `{complaints: [...]}`, and a bare array — don't narrow it without updating the backend contract.

### Styling

Tailwind v3 via PostCSS ([postcss.config.js](postcss.config.js), [tailwind.config.js](tailwind.config.js)). Global styles in [src/index.css](src/index.css): three `@tailwind` directives plus a `@layer base` block that sets `color-scheme: light dark` and body bg/text so dark mode doesn't leak light gaps. All component styling is inline utility classes — no CSS modules, no styled-components.

### Tests

Vitest + jsdom + Testing Library. [src/test/smoke.test.jsx](src/test/smoke.test.jsx) renders Login behind a mocked `useAuth` — extend this pattern when adding form tests (mock the context, wrap in `<MemoryRouter>` with the target path).

## ESLint note

`react-hooks/set-state-in-effect` is intentionally **off** ([eslint.config.js](eslint.config.js)) — the v7 rule wants React Query/SWR, which is out of scope. If you introduce TanStack Query, flip that rule back on.
