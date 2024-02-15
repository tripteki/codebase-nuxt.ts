"use strict";

const seoConfig = {

    app: {

        head: {

            titleTemplate: 'Vue | %s',

            link: [

                {
                    rel: "icon", type: "image/png", href: "/favicon.png",
                },
            ],

            script: [

                {
                    async: true,
                    src: "https://unpkg.com/@material-tailwind/html/scripts/ripple.js",
                },
            ],
        },
    },

    site: {

        name: process.env.NUXT_PUBLIC_APP_NAME || "codebase",
        url: process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost",
        defaultLocale: process.env.NUXT_PUBLIC_APP_LANG || "en",
    },
};

export default seoConfig;
