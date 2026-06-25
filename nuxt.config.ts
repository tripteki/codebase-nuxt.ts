"use strict";

const { name, version, } = require ("./package.json");
import tailwindcss from "@tailwindcss/vite";
import i18n from "./nuxt-i18n.config";
import seo from "./nuxt-seo.config";
import { defaultBrandColors, } from "./lib/branding";
import { createPwaManifest, } from "./lib/pwa-manifest";
import { PWA_NAVIGATION_DENYLIST, } from "./lib/pwa-navigation-denylist";
import { pwaSplashLinks, } from "./lib/pwa-splash-links";

const appName = process.env.NUXT_PUBLIC_APP_NAME || name || "codebase";
const formattedAppName = appName.charAt (0).toUpperCase () + appName.slice (1);
const appDescription = `The ${appName} WebApp!`;
const appUrl = process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost";
const webPushEnabled = Boolean (process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY?.trim ());
const isDev = process.env.NODE_ENV === "development";
const pwaDevEnabled = isDev;

export default defineNuxtConfig ({

    buildDir: "public/.nuxt",

    typescript: {

        strict: true,
        typeCheck: "build",
        tsConfig: {
            exclude: [
                "../../tests",
                "../../playwright.config.ts",
                "../../vitest.config.ts",
            ],
        },
    },

    // https://masteringnuxt.com/blog/configuration-in-nuxt-3-runtimeConfig-vs-appConfig
    // https://nuxt.com/docs/api/composables/use-runtime-config

    runtimeConfig: {

        secret: process.env.SECRET,

        public: {

            appName: process.env.NUXT_PUBLIC_APP_NAME || name || "codebase",
            appVersion: process.env.NUXT_PUBLIC_APP_VERSION || version || "1.0.0",
            appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000",
            baseURL: process.env.NUXT_PUBLIC_BASE_URL || "http://api.backend.localhost/api",
            authURL: process.env.NUXT_PUBLIC_AUTH_URL || "http://api.backend.localhost/api/v1/auth",
            apiUrl: process.env.NUXT_PUBLIC_API_URL || "http://api.backend.localhost",
            reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || "",
            reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || "127.0.0.1",
            reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || "8080",
            reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || "http",
            vapidPublicKey: process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY || "",
            realtimeDriver: process.env.NUXT_PUBLIC_REALTIME_DRIVER || "echo",
            env: process.env.NUXT_PUBLIC_APP_ENV || "local",
            language: process.env.NUXT_PUBLIC_APP_LANG || "en",
        },
    },

    modules: [

        "@vite-pwa/nuxt",
        "@nuxtjs/i18n",
        "@nuxtjs/seo",
        "@pinia/nuxt",
        "@sidebase/nuxt-auth",
        "@nuxtjs/device",
        "@nuxtjs/color-mode",
        "nuxt-toastify",
    ],

    plugins: [

        "~/plugins/flowbite.client.ts",
        "~/plugins/apexchart.client.ts",
        "~/plugins/pwa-head.ts",
        "~/plugins/pwa-install-banner.client.ts",
        "~/plugins/web-push.client.ts",
    ],

    pwa: {

        registerType: "autoUpdate",

        strategies: "injectManifest",

        srcDir: "service",

        filename: "sw.ts",

        injectRegister:
            pwaDevEnabled || webPushEnabled || ! isDev ? "auto" : false,

        devOptions: {

            enabled: pwaDevEnabled,
            type: "module",
            navigateFallback: "/",
        },

        manifest: createPwaManifest ({
            name: formattedAppName,
            shortName: appName,
            description: appDescription,
        }),

        workbox: {

            navigateFallback: "/",
            navigateFallbackDenylist: PWA_NAVIGATION_DENYLIST,
            globPatterns: [
                "**/*.{js,css,html,ico,png,svg,webmanifest}",
            ],
        },

        client: {

            installPrompt: false,
        },
    },

    routeRules: {

        "/sw.js": { prerender: false, },
        "/dev-sw.js": { prerender: false, },
        "/workbox-*.js": { prerender: false, },
        "/manifest.webmanifest": { prerender: false, },
        "/api/pwa/manifest": { prerender: false, },
        "/auth/login": { redirect: "/admin/auth/login", },
        "/auth/register": { redirect: "/admin/auth/register", },
        "/auth/forgot-password": { redirect: "/admin/auth/forgot-password", },
    },

    auth: {

        baseURL: `${process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost"}/api/auth`,

        // Sidebase SSR refresh runs on every request and logs 401 when cookies are stale.
        // Client session + plugins/auth-refresh.server.ts handle refresh when the JWT expires.
        disableServerSideAuth: true,

        globalAppMiddleware: false,

        provider: {

            type: "local",

            endpoints: {

                signIn: { path: "login", method: "post", },
                signOut: { path: "logout", method: "post", },
                getSession: { path: "me", method: "get", },
            },

            token: {

                signInResponseTokenPointer: "/accessToken",
                type: "Bearer",
                headerName: "Authorization",
                maxAgeInSeconds: 60 * 60 * 24 * 30,
            },

            session: {

                dataResponsePointer: "/user",

                dataType: {
                    refreshToken: "string",
                    user: "object",
                    jwt: "string",
                },
            },

            refresh: {

                isEnabled: true,

                endpoint: {
                    path: "refresh",
                    method: "put",
                },

                refreshOnlyToken: false,

                token: {
                    signInResponseRefreshTokenPointer: "/refreshToken",
                    refreshResponseTokenPointer: "/accessToken",
                    refreshRequestTokenPointer: "/refreshToken",
                },
            },

            pages: {

                login: "/admin/auth/login",
            },
        },
    },

    sessionRefresh: {

        enablePeriodically: 50 * 60 * 1000,
        enableOnWindowFocus: true,
    },

    pinia: {

        storesDirs: [ "./stores/**", ],
    },

    // @ts-ignore
    i18n,

    ... seo,

    ogImage: {

        enabled: false,
    },

    ... (process.env.BUILD_STATIC ? {
        ssr: false,
        nitro: {
            preset: "static",
        },
    } : {}),

    vite: {

        plugins: [tailwindcss ()],
    },

    css: [

        "~/assets/css/main.css",
    ],

    toastify: {

        autoClose: 2000,
        theme: "auto",
        position: "top-center",
    },

    colorMode: {

        classSuffix: "",
    },

    app: {

        head: {

            meta: [
                {
                    name: "robots",
                    content: "index, follow",
                },
                {
                    name: "apple-mobile-web-app-title",
                    content: formattedAppName,
                },
                {
                    name: "application-name",
                    content: formattedAppName,
                },
                {
                    name: "theme-color",
                    content: defaultBrandColors.primary,
                },
                {
                    name: "mobile-web-app-capable",
                    content: "yes",
                },
                {
                    name: "apple-mobile-web-app-capable",
                    content: "yes",
                },
                {
                    name: "apple-mobile-web-app-status-bar-style",
                    content: "default",
                },
                {
                    name: "viewport",
                    content: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover",
                },
                {
                    name: "description",
                    content: appDescription,
                },
                {
                    property: "og:url",
                    content: appUrl,
                },
                {
                    property: "og:type",
                    content: "website",
                },
                {
                    property: "og:title",
                    content: formattedAppName,
                },
                {
                    property: "og:description",
                    content: appDescription,
                },
                {
                    name: "twitter:card",
                    content: "summary",
                },
                {
                    name: "twitter:title",
                    content: formattedAppName,
                },
                {
                    name: "twitter:description",
                    content: appDescription,
                },
            ],

            link: [
                {
                    rel: "canonical",
                    href: appUrl,
                },
                {
                    rel: "icon",
                    href: "/favicon.ico",
                    sizes: "any",
                },
                {
                    rel: "icon",
                    href: "/favicon.png",
                    type: "image/png",
                    sizes: "128x128",
                },
                {
                    rel: "manifest",
                    href: "/api/pwa/manifest",
                },
                {
                    rel: "apple-touch-icon",
                    href: "/manifest/icon-192x192.png",
                    sizes: "192x192",
                },
                ... pwaSplashLinks.map ((link) => ({
                    rel: link.rel,
                    href: link.href,
                    media: link.media,
                })),
            ],
        },
    },

    compatibilityDate: "2025-07-15",
});
