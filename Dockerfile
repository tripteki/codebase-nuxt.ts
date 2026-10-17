ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json .npmrc ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

ARG NUXT_PUBLIC_APP_NAME=codebase
ARG NUXT_PUBLIC_APP_URL=http://localhost:3000
ARG NUXT_PUBLIC_BASE_URL=http://api.backend.localhost/api
ARG NUXT_PUBLIC_AUTH_URL=http://api.backend.localhost/api/v1/auth
ARG NUXT_PUBLIC_API_URL=http://api.backend.localhost
ARG NUXT_PUBLIC_REALTIME_DRIVER=socketio
ARG NUXT_PUBLIC_REVERB_APP_KEY=
ARG NUXT_PUBLIC_REVERB_HOST=127.0.0.1
ARG NUXT_PUBLIC_REVERB_PORT=8080
ARG NUXT_PUBLIC_REVERB_SCHEME=http
ARG NUXT_PUBLIC_VAPID_PUBLIC_KEY=
ARG NUXT_PUBLIC_APP_ENV=production
ARG NUXT_PUBLIC_APP_LANG=en

ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1 \
    NUXT_PUBLIC_APP_NAME=${NUXT_PUBLIC_APP_NAME} \
    NUXT_PUBLIC_APP_URL=${NUXT_PUBLIC_APP_URL} \
    NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL} \
    NUXT_PUBLIC_AUTH_URL=${NUXT_PUBLIC_AUTH_URL} \
    NUXT_PUBLIC_API_URL=${NUXT_PUBLIC_API_URL} \
    NUXT_PUBLIC_REALTIME_DRIVER=${NUXT_PUBLIC_REALTIME_DRIVER} \
    NUXT_PUBLIC_REVERB_APP_KEY=${NUXT_PUBLIC_REVERB_APP_KEY} \
    NUXT_PUBLIC_REVERB_HOST=${NUXT_PUBLIC_REVERB_HOST} \
    NUXT_PUBLIC_REVERB_PORT=${NUXT_PUBLIC_REVERB_PORT} \
    NUXT_PUBLIC_REVERB_SCHEME=${NUXT_PUBLIC_REVERB_SCHEME} \
    NUXT_PUBLIC_VAPID_PUBLIC_KEY=${NUXT_PUBLIC_VAPID_PUBLIC_KEY} \
    NUXT_PUBLIC_APP_ENV=${NUXT_PUBLIC_APP_ENV} \
    NUXT_PUBLIC_APP_LANG=${NUXT_PUBLIC_APP_LANG}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm rebuild && npm run build

FROM node:${NODE_VERSION}-alpine AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

WORKDIR /app

COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO /dev/null "http://127.0.0.1:${PORT}/" || exit 1

CMD ["node", ".output/server/index.mjs"]
