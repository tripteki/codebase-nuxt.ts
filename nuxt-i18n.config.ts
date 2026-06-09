"use strict";

enum SupportedLanguages {

    en = "en",
    id = "id",
    ms = "ms",
};

const i18nConfig = {

    restructureDir: false,

    strategy: "no_prefix",

    detectBrowserLanguage: {
        useCookie: true,
        cookieKey: "i18n_redirected",
        redirectOn: "root",
        alwaysRedirect: false,
    },

    langDir: "lang",

    defaultLocale: (process.env.NUXT_PUBLIC_APP_LANG || "en") as SupportedLanguages,
    locales: [

        {
            code: "en",
            files: [ "en/auth.json", "en/common.json", ],
        },
        {
            code: "id",
            files: [ "id/auth.json", "id/common.json", ],
        },
        {
            code: "ms",
            files: [ "ms/auth.json", "ms/common.json", ],
        },
    ],
};

export default i18nConfig;
