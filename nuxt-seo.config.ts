"use strict";

const appName = process.env.NUXT_PUBLIC_APP_NAME || "codebase";
const formattedAppName = appName.charAt (0).toUpperCase () + appName.slice (1);

const seoConfig = {

    app: {

        head: {

            titleTemplate: `${formattedAppName} | %s`,
        },
    },

    site: {

        name: appName,
        url: process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost",
        defaultLocale: process.env.NUXT_PUBLIC_APP_LANG || "en",
    },
};

export default seoConfig;
