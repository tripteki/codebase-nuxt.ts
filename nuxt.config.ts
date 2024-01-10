"use strict";

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
            env: process.env.NUXT_PUBLIC_APP_ENV || "production",
        },
    },
});
