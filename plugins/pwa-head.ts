import { defaultBrandColors, } from "@/lib/branding";
import { syncPwaHead, } from "@/lib/pwa-manifest";

export default defineNuxtPlugin (() => {
    const config = useRuntimeConfig ();

    syncPwaHead ({
        fallbackAppName: String (config.public.appName ?? "App"),
        themeColor: defaultBrandColors.primary,
    });
});
