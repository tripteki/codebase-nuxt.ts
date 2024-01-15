"use strict";

const i18nConfig = {

    langDir: "./lang",

    defaultLocale: process.env.NUXT_PUBLIC_APP_LANG || "en",
    locales: [

        {
            code: "en",
            files: [ "en/_default.json", "en/common.json", ],
        },
        {
            code: "id",
            files: [ "id/_default.json", "id/common.json", ],
        },
    ],
};

export default i18nConfig;
