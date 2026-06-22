import { applyBrandCss, brandCssInlineStyle, } from "@/lib/apply-brand-css";
import { resolveBrandColors, } from "@/lib/branding";

export default defineNuxtPlugin (() => {
    const colors = resolveBrandColors ();

    useHead ({
        htmlAttrs: {
            style: brandCssInlineStyle (colors),
        },
    });

    if (import.meta.client) {
        applyBrandCss (document.documentElement, colors);
    }
});
