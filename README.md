<h1 align="center">Codebase Nuxt</h1>

Web frontend built with **Nuxt 4**, **Vue 3**, **@nuxtjs/i18n 10**, **@sidebase/nuxt-auth**, **Tailwind CSS 3**, and **PWA** support. Mirrors the Next.js reference implementation (`frontend/`).

### Features

| No | Feature | Description | Technology |
|----|---------|-------------|------------|
| 1 | SSR + static | Server build or static generate | Nuxt 4 + Nitro |
| 2 | Authentication | Login, register, forgot/reset password, verify email | @sidebase/nuxt-auth (local provider) |
| 3 | API proxy | Auth proxied to Laravel via Nitro routes | `server/api/auth/*` |
| 4 | I18N | English, Indonesian, Malay (cookie-based, no URL prefix) | @nuxtjs/i18n 10 |
| 5 | UI | Auth layout, dashboard, theme toggle | Tailwind + shadcn-vue |
| 6 | State | Pinia stores | @pinia/nuxt |
| 7 | Real-time (optional) | Laravel Echo + Reverb | laravel-echo + pusher-js |
| 8 | PWA | Workbox service worker, manifest, icons | @vite-pwa/nuxt |
| 9 | SEO | Site config, sitemap module | @nuxtjs/seo 5 |
| 10 | Charts | Dashboard chart widgets | ApexCharts + Chart.js |

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
NUXT_PUBLIC_APP_ENV=production
NUXT_PUBLIC_APP_LANG=en
PORT=3000
SECRET=123456
```

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_*` | Public runtime config (`runtimeConfig.public`) |
| `SECRET` | Server-only secret |

Ensure the Laravel backend is running and allows this app origin.

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

Output: `.output/public/` (SPA mode when `BUILD_STATIC=true` — same as Next static export pattern).

#### Lint

```bash
npm run lint
```

#### Add shadcn-vue component

```bash
npm run component
```

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

Route aliases (redirects): `/auth/login` → `/admin/auth/login`, etc. — configured in `nuxt.config.ts`.

### Authentication

- Provider: **local** via `@sidebase/nuxt-auth`
- Nitro endpoints: `server/api/auth/login.post.ts`, `logout`, `me`, `register`, etc.
- Token: Bearer from `/accessToken` in login response
- Session data: `/user` pointer
- Login page: `/admin/auth/login`

Auth base URL: `{NUXT_PUBLIC_APP_URL}/api/auth` (Nitro proxy → Laravel).

### Internationalization

- Locales: `en`, `id`, `ms`
- Strategy: **`no_prefix`** — locale in cookie `i18n_redirected`
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

Source: `backend/public/favicon.ico`, `backend/public/asset/logo.png`

Splash `<link>` tags: `lib/pwa-splash-links.ts` → injected in `nuxt.config.ts` `app.head.link`.

### Real-time (Laravel Echo)

Use the same Echo setup as the Next app. Configure `NUXT_PUBLIC_REVERB_*` and call Laravel `/broadcasting/auth` with the access token.

See `backend/README.md` for Reverb setup and event names.

### Modules

| Module | Purpose |
|--------|---------|
| `@nuxtjs/i18n` | Locales + cookie detection |
| `@nuxtjs/seo` | SEO, sitemap, robots |
| `@sidebase/nuxt-auth` | Session + JWT auth |
| `@vite-pwa/nuxt` | Service worker + manifest |
| `@nuxtjs/tailwindcss` | Tailwind CSS |
| `@nuxtjs/color-mode` | Dark mode (shadcn-vue) |
| `shadcn-nuxt` | UI components |
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
│   ├── ui/                        # shadcn-vue components
│   ├── I18nSwitcher.vue
│   └── ThemeToggle.vue
├── composables/                   # useLocale, useTheme, useCall
├── lang/                          # en, id, ms JSON
├── layouts/
├── server/
│   └── api/auth/                  # Nitro auth proxies
├── stores/
├── plugins/                       # apexchart, SW cleanup (dev)
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
