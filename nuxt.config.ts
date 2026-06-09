"use strict";

const { name, version, } = require ("./package.json");
import i18n from "./nuxt-i18n.config";
import seo from "./nuxt-seo.config";
import { pwaSplashLinks, } from "./lib/pwa-splash-links";

const appName = process.env.NUXT_PUBLIC_APP_NAME || name || "codebase";
const formattedAppName = appName.charAt (0).toUpperCase () + appName.slice (1);
const appDescription = `The ${appName} WebApp!`;
const appUrl = process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost";

export default defineNuxtConfig ({

    buildDir: "public/.nuxt",

    typescript: {

        strict: true,
        typeCheck: true,
    },

    // https://masteringnuxt.com/blog/configuration-in-nuxt-3-runtimeConfig-vs-appConfig
    // https://nuxt.com/docs/api/composables/use-runtime-config

    runtimeConfig: {

        secret: process.env.SECRET,

        public: {

            appName: process.env.NUXT_PUBLIC_APP_NAME || name || "codebase",
            appVersion: process.env.NUXT_PUBLIC_APP_VERSION || version || "1.0.0",
            appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost",
            baseURL: process.env.NUXT_PUBLIC_BASE_URL || "http://api.backend.localhost",
            authURL: process.env.NUXT_PUBLIC_AUTH_URL || "http://api.backend.localhost/api/v1/auth",
            apiUrl: process.env.NUXT_PUBLIC_API_URL || "http://api.backend.localhost",
            reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || "",
            reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || "127.0.0.1",
            reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || "8080",
            reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || "http",
            env: process.env.NUXT_PUBLIC_APP_ENV || "production",
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
        "nuxt-toastify",
        "@nuxtjs/tailwindcss",
        "shadcn-nuxt",
    ],

    plugins: [

        "~/plugins/apexchart.client.ts",
        "~/plugins/service-worker-cleanup.client.ts",
    ],

    pwa: {

        registerType: "autoUpdate",

        injectRegister: process.env.NODE_ENV === "production" ? "auto" : false,

        devOptions: {

            enabled: false,
            type: "module",
        },

        manifest: {

            name: formattedAppName,
            short_name: appName,
            description: appDescription,

            id: "/",
            start_url: "/",
            display: "standalone",
            orientation: "portrait",
            theme_color: "#FFFFFF",
            background_color: "#FFFFFF",

            icons: [

                {
                    src: "/manifest/icon-192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                },
                {
                    src: "/manifest/icon-384x384.png",
                    sizes: "384x384",
                    type: "image/png",
                },
                {
                    src: "/manifest/icon-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                },
            ],
        },

        workbox: {

            navigateFallback: "/",
            navigateFallbackDenylist: [
                /^\/api/,
                /^\/sw\.js$/,
                /^\/workbox-.*\.js$/,
                /^\/manifest\.webmanifest$/,
            ],
            globPatterns: [
                "**/*.{js,css,html,ico,png,svg,webmanifest}",
            ],
        },
    },

    routeRules: {

        "/sw.js": { prerender: false, },
        "/workbox-*.js": { prerender: false, },
        "/manifest.webmanifest": { prerender: false, },
        "/auth/login": { redirect: "/admin/auth/login", },
        "/auth/register": { redirect: "/admin/auth/register", },
        "/auth/forgot-password": { redirect: "/admin/auth/forgot-password", },
    },

    auth: {

        baseURL: `${process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost"}/api/auth`,

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

                isEnabled: false,
            },

            pages: {

                login: "/admin/auth/login",
            },
        },
    },

    pinia: {

        storesDirs: [ "./stores/**", ],
    },

    // @ts-ignore
    i18n,

    ... seo,

    ... (process.env.BUILD_STATIC ? {
        ssr: false,
        ogImage: {
            enabled: false,
        },
        nitro: {
            preset: "static",
        },
    } : {}),

    postcss: {

        plugins: {

            tailwindcss: {},
            autoprefixer: {},
        },
    },

    css: [

        "~/assets/css/main.css",
    ],

    toastify: {

        autoClose: 2000,
        theme: "auto",
        position: "top-center",
    },

    shadcn: {

        prefix: "",
        componentDir: './components/ui',
    },

    tailwindcss: {

        cssPath: "~/assets/css/main.css",
        configPath: "tailwind.config.js",
    },

    app: {

        head: {

            meta: [
                {
                    name: "robots",
                    content: "index, follow",
                },
                {
                    name: "theme-color",
                    content: "#FFFFFF",
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
                    href: "/manifest.webmanifest",
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

    compatibilityDate: "2024-11-20",
});
