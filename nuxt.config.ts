"use strict";

import i18n from "./nuxt-i18n.config";
import seo from "./nuxt-seo.config";

export default defineNuxtConfig ({

    typescript: {

        strict: true,
        typeCheck: true,
    },

    // https://masteringnuxt.com/blog/configuration-in-nuxt-3-runtimeConfig-vs-appConfig
    // https://nuxt.com/docs/api/composables/use-runtime-config

    runtimeConfig: {

        secret: process.env.SECRET,

        public: {

            appName: process.env.NUXT_PUBLIC_APP_NAME || "codebase",
            appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost",
            baseURL: process.env.NUXT_PUBLIC_BASE_URL || "http://api.backend.localhost",
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
    ],

    plugins: [

        "~/plugins/apexchart.client.ts",
    ],

    pwa: {

        devOptions: {

            enabled: true,
            type: "module",
        },

        manifest: {

            name: process.env.NUXT_PUBLIC_APP_NAME || "codebase",
            short_name: process.env.NUXT_PUBLIC_APP_NAME || "codebase",

            id: "/",
            start_url: "/",
            display: "standalone",
            orientation: "portrait",
            theme_color: "#FFFFFF",
            background_color: "#FFFFFF",

            icons: [

                {
                    src: "/manifest/android-chrome-192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/manifest/android-chrome-384x384.png",
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
        },
    },

    auth: {

        baseURL: process.env.NUXT_PUBLIC_AUTH_URL || "http://api.backend.localhost/auth",

        provider: {

            type: "local",

            endpoints: {

                signIn: { path: "/login", method: "post", },
                signOut: { path: "/logout", method: "post", },
                getSession: { path: "/me", method: "get", },
            },

            token: {

                signInResponseTokenPointer: "/data/token",
            },

            pages: {

                login: "/auth/login",
            },
        },
    },

    pinia: {

        storesDirs: [ "./stores/**", ],
    },

    i18n,

    ... seo,

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

    compatibilityDate: "2024-11-20",
});