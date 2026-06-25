import { initFlowbite, } from "flowbite";

export default defineNuxtPlugin ((nuxtApp) => {
    if (! import.meta.client) {
        return;
    }

    nuxtApp.hook ("page:finish", () => {
        initFlowbite ();
    });
});
