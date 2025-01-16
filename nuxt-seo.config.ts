"use strict";

const seoConfig = {

    app: {

        head: {

            titleTemplate: "Vue | %s",
        },
    },

    site: {

        name: process.env.NUXT_PUBLIC_APP_NAME || "codebase",
        url: process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost",
        defaultLocale: process.env.NUXT_PUBLIC_APP_LANG || "en",
    },
};

export default seoConfig;
