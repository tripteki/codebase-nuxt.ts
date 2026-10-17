"use strict";

import { formatAppName, } from "./lib/app-name";

const appName = process.env.NUXT_PUBLIC_APP_NAME || "codebase";
const formattedAppName = formatAppName (appName);

const seoConfig = {

    site: {

        name: formattedAppName,
        url: process.env.NUXT_PUBLIC_APP_URL || "http://frontend.localhost",
        defaultLocale: process.env.NUXT_PUBLIC_APP_LANG || "en",
    },
};

export default seoConfig;
