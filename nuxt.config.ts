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

        "@nuxtjs/i18n",
        "@nuxtjs/seo",
        "@pinia/nuxt",
        "@sidebase/nuxt-auth",
        "vuetify-nuxt-module",
        "@nuxtjs/device",
    ],

    plugins: [

        //
    ],

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

    ...seo,

    vuetify: {

        moduleOptions: {

            treeshaking: true,
        },

        vuetifyOptions: {

            customVariables: [ '~/assets/css/variables.scss', ],
        },
    },

    postcss: {

        plugins: {

            tailwindcss: {},
            autoprefixer: {},
        },
    },

    css: [

        "~/assets/css/main.css",
    ],
});
