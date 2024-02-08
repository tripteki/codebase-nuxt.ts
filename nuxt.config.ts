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

        "@invictus.codes/nuxt-vuetify",
        "@nuxtjs/i18n",
        "@nuxtjs/seo",
    ],

    vuetify: {

        moduleOptions: {

            treeshaking: true,
        },
    },

    i18n,

    ...seo,
});
