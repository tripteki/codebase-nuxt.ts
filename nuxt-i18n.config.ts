"use strict";

enum SupportedLanguages {

    en = "en",
    id = "id",
};

const i18nConfig = {

    detectBrowserLanguage: false,

    strategy: "no_prefix",

    langDir: "../lang",

    defaultLocale: process.env.NUXT_PUBLIC_APP_LANG as SupportedLanguages,
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
