<h1 align="center">Codebase Nuxt</h1>

Web frontend built with Nuxt 4, Vue 3, Tailwind CSS 4, Flowbite, and PWA support. It talks to Codebase FastAPI, Codebase NestJS, or Codebase Laravel through one REST contract.

## Conventions

| Topic | Rule |
|-------|------|
| Brand | Codebase. Primary `#2563eb`, secondary `#84cc16`, tertiary `#1e3a8a` |
| Roles | `superadmin`, `admin`, `user` |
| Format | Indent 4, double quotes, trailing commas, space before `(`, K&R braces. No JSDoc in `lib/` or composables |
| Auth pages | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` |
| Validation | HTTP 422 `{ "detail": [...] }` from the backend |
| Locales | `en`, `id`, `ms` |

Cursor rules live in `.cursor/rules/`.

## Features

| Feature | Technology |
|---------|------------|
| SSR and static generate | Nuxt 4 + Nitro |
| Authentication | @sidebase/nuxt-auth (local provider) |
| Internationalization | @nuxtjs/i18n (cookie, no URL prefix) |
| UI | Tailwind CSS 4 + Flowbite |
| Admin | Users, roles, permissions, activities, notifications, settings, dashboard |
| Realtime | Socket.IO or Laravel Echo |
| Web Push | VAPID |
| State | Pinia |
| PWA | @vite-pwa/nuxt |
| SEO | @nuxtjs/seo |
| Charts | ApexCharts |

## Getting Started

### Requirements

- Node.js 20+ (22 LTS recommended)
- npm 10+

### Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:3000`.

### Configuration

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_APP_URL` | This app's URL |
| `NUXT_PUBLIC_BASE_URL` | Backend API URL ending in `/api` |
| `NUXT_PUBLIC_AUTH_URL` | Backend auth URL ending in `/api/v1/auth` |
| `NUXT_PUBLIC_API_URL` | Backend root URL |
| `NUXT_PUBLIC_REALTIME_DRIVER` | `socketio` for FastAPI and NestJS, `echo` for Laravel |
| `NUXT_PUBLIC_REVERB_*` | Reverb key, host, port, and scheme when the driver is `echo` |
| `NUXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional Web Push key |
| `NUXT_PUBLIC_BRAND_*` | Optional brand color overrides (hex) |
| `SECRET` | Server-only secret |

The backend must allow this app's origin in its CORS settings.

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start the production build |
| `npm run preview` | Preview the production build |
| `npm run generate` | Static output in `.output/public/` |
| `npm run lint` | Lint and format |
| `npm run test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |

## Docker

The image is `node:24-alpine` and only keeps `.output`.

```bash
cp .env.example .env
docker compose up -d --build
```

`NUXT_PUBLIC_*` values are build arguments read from `.env`, so rebuild after changing them. The browser and the Nuxt server both call the backend at those URLs. Compose maps `api.backend.localhost` and `host.docker.internal` to the Docker host, so a backend published on the host is reachable from the container.

## Routes

| Path | Access |
|------|--------|
| `/` | Public |
| `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` | Guest |
| `/auth/reset-password/[email]`, `/auth/verify-email/[email]` | Signed link |
| `/admin/dashboard` | Signed in |
| `/admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/activities` | Signed in with permission |
| `/admin/settings`, `/notifications` | Signed in |

`/admin/auth/**` redirects to `/auth/**`.

## Authentication

Login goes through the Nitro routes in `server/api/auth/`. The backend `accessToken` is sent as `Authorization: Bearer` on API calls.

## Realtime

| Driver | Backend | Transport |
|--------|---------|-----------|
| `socketio` | FastAPI, NestJS | `socket.io-client` |
| `echo` | Laravel | Laravel Echo + Reverb |

Notifications and admin refresh events are wired in `useNotificationBroadcast` and `useAdminRefresh`. For other events, use the shared client:

```typescript
import { useSocket } from "@/composables/useSocket";

const { data: client } = await useSocket();

client?.subscribeUserEvent(userId, "v1.user.admin.exported", (payload) => {
    console.log(payload.fileUrl);
});
```

| Event | Payload |
|-------|---------|
| `v1.notification.created` | `id`, `unread` |
| `v1.admin.refresh` | `userId`, `scopes` |
| `v1.user.admin.imported` | `userId`, `filename`, `totalImported`, `totalSkipped` |
| `v1.user.admin.exported` | `userId`, `filename`, `fileUrl` |
| `v1.user.admin.activated`, `v1.user.admin.deactivated` | User fields |

## UI and Theme

| Item | Location |
|------|----------|
| Styles | `assets/css/main.css`, `assets/css/brand-theme.css` |
| Class tokens | `lib/flowbite-classes.ts` |
| Components | `components/flowbite/Fb*.vue` |
| Brand colors | `lib/branding.ts`, injected by `plugins/brand-css.ts` |
| Translations | `lang/{en,id,ms}/` |
| PWA assets | `public/manifest/` |

## Project Structure

```
codebase-nuxt.ts/
├── assets/
├── components/
├── composables/
├── lang/
├── layouts/
├── lib/
├── pages/
├── plugins/
├── public/
├── server/
├── stores/
├── tests/
└── nuxt.config.ts
```

## Author

- Trip Teknologi ([@tripteki](https://linkedin.com/company/tripteki))
- Hasby Maulana ([@hsbmaulana](https://linkedin.com/in/hsbmaulana))
