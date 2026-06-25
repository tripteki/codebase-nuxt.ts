<h1 align="center">Codebase Nuxt</h1>

Web frontend built with **Nuxt 4**, **Vue 3**, **@nuxtjs/i18n 10**, **@sidebase/nuxt-auth**, **Tailwind CSS 4**, **Flowbite**, and **PWA** support. Consumes a backend-agnostic HTTP API via `NUXT_PUBLIC_*_URL` environment variables.

### Features

| No | Feature | Description | Technology |
|----|---------|-------------|------------|
| 1 | SSR + static | Server build or static generate | Nuxt 4 + Nitro |
| 2 | Authentication | Login, register, forgot/reset password, verify email | @sidebase/nuxt-auth (local provider) |
| 3 | API proxy | Auth proxied to backend via Nitro routes | `server/api/auth/*` |
| 4 | I18N | English, Indonesian, Malay (cookie-based, no URL prefix) | @nuxtjs/i18n 10 |
| 5 | UI | Auth layout, dashboard, theme toggle | Tailwind CSS 4 + Flowbite |
| 6 | User & profile | `/users/me`, interests, password update | `useUserProfile` → REST API |
| 7 | Notifications | List, read, delete, unread badge | `useNotifications` → `/api/v1/notifications/*` |
| 8 | Real-time | Notifications + optional admin events | `useNotificationBroadcast` + Echo/Reverb or Socket.IO |
| 9 | Web Push | VAPID subscribe via Nitro proxy | `plugins/web-push.client.ts` |
| 10 | State | Pinia stores | @pinia/nuxt |
| 11 | PWA | Workbox service worker, manifest, icons | @vite-pwa/nuxt |
| 12 | SEO | Site config, sitemap module | @nuxtjs/seo 5 |
| 13 | Charts | Dashboard chart widgets | ApexCharts + Chart.js |

Getting Started
---

### Requirements

- Node.js >= 20 (recommended: 22 LTS)
- npm >= 10

### Installation

```bash
cd codebase-nuxt.ts

npm install

cp .env.example .env
```

`postinstall` runs `nuxt prepare` automatically.

### Configuration

Update `.env`:

```env
NUXT_PUBLIC_APP_NAME=codebase
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_PUBLIC_BASE_URL=http://api.backend.localhost/api
NUXT_PUBLIC_AUTH_URL=http://api.backend.localhost/api/v1/auth
NUXT_PUBLIC_API_URL=http://api.backend.localhost
NUXT_PUBLIC_REVERB_APP_KEY=codebase-key
NUXT_PUBLIC_REVERB_HOST=127.0.0.1
NUXT_PUBLIC_REVERB_PORT=8080
NUXT_PUBLIC_REVERB_SCHEME=http
NUXT_PUBLIC_REALTIME_DRIVER=echo
NUXT_PUBLIC_VAPID_PUBLIC_KEY=
NUXT_PUBLIC_APP_ENV=production
NUXT_PUBLIC_APP_LANG=en
PORT=3000
SECRET=123456
```

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_API_URL` | Backend API root URL (Swagger: `{API_URL}/api/docs`) |
| `NUXT_PUBLIC_REALTIME_DRIVER` | `echo` (Reverb, default) or `socketio` (Socket.IO API) |
| `NUXT_PUBLIC_REVERB_*` | Required when `REALTIME_DRIVER=echo` |
| `NUXT_PUBLIC_*` | Public runtime config (`runtimeConfig.public`) |
| `SECRET` | Server-only secret |

Ensure the API backend is running and allows this app origin.

### Running the Application

#### Development

```bash
npm run dev
```

App: `http://localhost:3000`

#### Production (Node server)

```bash
npm run build
npm run start
```

Preview production build locally:

```bash
npm run preview
```

#### Static export

```bash
npm run generate
```

Output: `.output/public/` (SPA mode when `BUILD_STATIC=true` - same as Next static export pattern).

#### Lint

```bash
npm run lint
```

### UI (Flowbite)

- **CSS:** `assets/css/main.css` — Tailwind v4 + Flowbite plugin + `brand-theme.css`
- **Class tokens:** `lib/flowbite-classes.ts` (`fbCard`, `fbMuted`, `fbAlert*`, …)
- **Components:** `components/flowbite/Fb*.vue` — thin wrappers (`FbButton`, `FbInput`, `FbLabel`, `FbCheckbox`, `FbSpinner`, `FbApexChart`, `FbDataTable`, `FbWysiwyg`)
- **Init:** `plugins/flowbite.client.ts` calls `initFlowbite()` on `page:finish`
- **Alerts:** use `AlertSuccess`, `AlertWarning`, `AlertError` — not raw Flowbite JS widgets

### Brand theme

- **CSS variables:** `--brand-primary`, `--brand-secondary`, `--brand-tertiary` in `assets/css/brand-theme.css`
- **Runtime:** `plugins/brand-css.ts` injects colors from `lib/branding.ts`
- **Override via env (optional):** `NUXT_PUBLIC_BRAND_PRIMARY`, `NUXT_PUBLIC_BRAND_SECONDARY`, `NUXT_PUBLIC_BRAND_TERTIARY` (hex)
- **Charts:** `FbApexChart` reads brand colors from CSS variables at render time

### Flowbite plugins (reusable wrappers)

| Plugin | Deps | Component | Notes |
|--------|------|-----------|-------|
| Charts | `apexcharts`, `vue3-apexcharts` | `FbApexChart` | `lib/flowbite-chart-options.ts` — dark mode via `@nuxtjs/color-mode` |
| Datatables | `simple-datatables` | `FbDataTable` | slot `<thead>` / `<tbody>`; pass `options` from [Flowbite datatables docs](https://flowbite.com/docs/plugins/datatables/) |
| WYSIWYG | TipTap + `flowbite-typography` | `FbWysiwyg` | `v-model` HTML; StarterKit toolbar |

### Routes

| Path | Auth | Description |
|------|------|-------------|
| `/` | guest | Landing page |
| `/admin/auth/login` | guest | Login |
| `/admin/auth/register` | guest | Register |
| `/admin/auth/forgot-password` | guest | Forgot password |
| `/admin/auth/reset-password` | guest | Reset password (token query) |
| `/admin/dashboard` | required | Dashboard |
| `/auth/reset-password/[email]` | guest + signed | Reset via signed URL |
| `/auth/verify-email/[email]` | guest + signed | Email verification |

Route aliases (redirects): `/auth/login` → `/admin/auth/login`, etc. - configured in `nuxt.config.ts`.

### Authentication

- Provider: **local** via `@sidebase/nuxt-auth`
- Nitro endpoints: `server/api/auth/login.post.ts`, `logout`, `me`, `register`, etc.
- Token: Bearer from `/accessToken` in login response
- Session data: `/user` pointer
- Login page: `/admin/auth/login`

Auth base URL: `{NUXT_PUBLIC_APP_URL}/api/auth` (Nitro proxy → backend API).

### Internationalization

- Locales: `en`, `id`, `ms`
- Strategy: **`no_prefix`** - locale in cookie `i18n_redirected`
- Translation files: `lang/{locale}/{auth,common}.json`
- Composable: `useLocale()`, `useTranslation()`
- Config: `nuxt-i18n.config.ts`

### PWA

Configured in `nuxt.config.ts` via `@vite-pwa/nuxt`. Assets under `public/`:

| Path | Description |
|------|-------------|
| `/manifest.webmanifest` | Web app manifest |
| `/manifest/icon-*.png` | App icons |
| `/manifest/splash/*.png` | Apple splash screens |
| `/favicon.ico`, `/favicon.png` | Favicons |

Re-sync from backend:

```bash
bash ../scripts/sync-pwa-assets.sh
```

Source: API server `public/favicon.ico` and `public/asset/logo.png`

Splash `<link>` tags: `lib/pwa-splash-links.ts` → injected in `nuxt.config.ts` `app.head.link`.

### Real-time

The app supports two realtime drivers via `NUXT_PUBLIC_REALTIME_DRIVER`:

| Driver | API | Transport |
|--------|-----|-----------|
| `echo` (default) | Reverb broadcast | Laravel Echo + Reverb (Pusher protocol) |
| `socketio` | Socket.IO | `socket.io-client` |

Values are read from `nuxt.config.ts` → `runtimeConfig.public` and `lib/realtime-config.ts`. Use `.env` for local overrides (for example `localhost:8000`); `.env.example` shows the default template URLs.

#### Echo driver (`echo`)

```env
NUXT_PUBLIC_REALTIME_DRIVER=echo
NUXT_PUBLIC_REVERB_APP_KEY=codebase-key
NUXT_PUBLIC_REVERB_HOST=127.0.0.1
NUXT_PUBLIC_REVERB_PORT=8080
NUXT_PUBLIC_REVERB_SCHEME=http
```

Requires API with `BROADCAST_CONNECTION=reverb`, a running Reverb server, and `POST /broadcasting/auth`.

#### Socket.IO driver (`socketio`)

```env
NUXT_PUBLIC_REALTIME_DRIVER=socketio
NUXT_PUBLIC_API_URL=http://localhost:8000
```

- WebSocket auth uses the **access token** (Bearer).
- **Email must be verified** — the API rejects Socket.IO connections when `email_verified_at` is empty.
- Multi-worker APIs may use Redis as a Socket.IO message queue; configure `MEMORY_REDIS_*` for production.

#### Client API

Bootstrap via `useSocket()` or `createRealtimeClient()` (`lib/realtime-client.ts`):

```typescript
import { useSocket, } from "@/composables/useSocket";

const { data: client, isSuccess, } = await useSocket();

if (isSuccess && client)
{
    client.subscribeUserEvent (userId, "v1.notification.created", (payload) =>
    {
        // { id, unread }
    });
}
```

Notifications are wired automatically in `useNotificationBroadcast` (used by `NotificationShellExtras.vue`).

#### Admin import / export events

Subscribe with the same pattern when you need live progress on admin pages:

```typescript
client.subscribeUserEvent (userId, "v1.user.admin.imported", (payload) =>
{
    // { userId, filename, totalImported, totalSkipped }
});

client.subscribeUserEvent (userId, "v1.user.admin.imported-failed", (payload) =>
{
    // { userId, filename, error }
});

client.subscribeUserEvent (userId, "v1.user.admin.exported", (payload) =>
{
    // { userId, filename, fileUrl, filePath }
});

client.subscribeUserEvent (userId, "v1.user.admin.exported-failed", (payload) =>
{
    // { userId, error }
});

client.subscribeUserEvent (userId, "v1.user.admin.activated", (payload) => { /* ... */ });
client.subscribeUserEvent (userId, "v1.user.admin.deactivated", (payload) => { /* ... */ });
```

Call `client.unsubscribe()` or `client.disconnect()` when leaving the page.

#### Broadcast events (all backends)

| Event | Payload (summary) |
|-------|-------------------|
| `v1.notification.created` | `id`, `unread` |
| `v1.user.admin.imported` | `userId`, `filename`, `totalImported`, `totalSkipped` |
| `v1.user.admin.imported-failed` | `userId`, `filename`, `error` |
| `v1.user.admin.exported` | `userId`, `filename`, `fileUrl`, `filePath` |
| `v1.user.admin.exported-failed` | `userId`, `error` |
| `v1.user.admin.activated` | user fields (`id`, `name`, `email`, …) |
| `v1.user.admin.deactivated` | user fields (`id`, `name`, `email`, …) |

With `echo`, events use a leading dot when listening on a private channel (handled inside `subscribeUserEvent`). With `socketio`, event names are used as-is.

Low-level Echo helper (`echo` driver): `lib/echo.ts` → `createEcho(accessToken)`.

### Modules

| Module | Purpose |
|--------|---------|
| `@nuxtjs/i18n` | Locales + cookie detection |
| `@nuxtjs/seo` | SEO, sitemap, robots |
| `@sidebase/nuxt-auth` | Session + JWT auth |
| `@vite-pwa/nuxt` | Service worker + manifest |
| `@tailwindcss/vite` | Tailwind CSS 4 (Vite plugin) |
| `flowbite` | UI theme + Tailwind plugin |
| `@nuxtjs/color-mode` | Dark mode (`class`) |
| `@pinia/nuxt` | State management |
| `nuxt-toastify` | Toast notifications |

### Project Structure

```
codebase-nuxt.ts/
├── pages/
│   ├── index.vue
│   ├── admin/auth/                # Login, register, forgot/reset
│   ├── admin/dashboard/
│   └── auth/                      # Signed URL flows
├── components/
│   ├── AuthLayout.vue
│   ├── flowbite/                  # FbButton, FbInput, FbLabel, …
│   ├── I18nSwitcher.vue
│   └── ThemeToggle.vue
├── composables/                   # useSocket, useNotificationBroadcast, useCall
├── lib/                           # echo, realtime-client, api-base, flowbite-classes
├── lang/                          # en, id, ms JSON
├── layouts/
├── server/
│   └── api/auth/                  # Nitro auth proxies
├── stores/
├── plugins/                       # flowbite, apexchart, web-push, PWA
├── public/manifest/               # PWA assets
├── nuxt.config.ts
├── nuxt-i18n.config.ts
├── nuxt-seo.config.ts
└── .env.example
```

Author
---

- Trip Teknologi ([@tripteki](https://linkedin.com/company/tripteki))
- Hasby Maulana ([@hsbmaulana](https://linkedin.com/in/hsbmaulana))
