import { defineNuxtPlugin, } from "#imports";
import { createVNode, render, } from "vue";

import PwaInstallBanner from "@/components/PwaInstallBanner.vue";
import { attachPwaInstallListener, } from "@/lib/pwa-install";

export default defineNuxtPlugin ({
    name: "pwa-install-banner",
    setup (nuxtApp) {
        attachPwaInstallListener ();

        nuxtApp.hook ("app:mounted", () => {
            const container = document.createElement ("div");
            container.id = "pwa-install-banner-root";
            document.body.appendChild (container);

            const vnode = createVNode (PwaInstallBanner);
            vnode.appContext = nuxtApp.vueApp._context;
            render (vnode, container);
        });
    },
});
