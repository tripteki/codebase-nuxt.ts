"use strict";

import "preline/preline";
import { type IStaticMethods, } from "preline/preline";

declare global {

    interface Window {

        HSStaticMethods: IStaticMethods;
    }
};

export default defineNuxtPlugin ((plugin) => {

    plugin.hook ("page:finish", () => {

        window.HSStaticMethods.autoInit ();
    });
});
