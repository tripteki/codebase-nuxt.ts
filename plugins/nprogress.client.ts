import NProgress from "nprogress";

const MINIMUM_MS = 280;

export default defineNuxtPlugin (() => {
    NProgress.configure ({
        showSpinner: false,
        trickleSpeed: 120,
        minimum: 0.08,
        easing: "ease",
        speed: 280,
    });

    let startedAt = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    function start (): void {
        if (hideTimer) {
            clearTimeout (hideTimer);
        }

        startedAt = Date.now ();
        NProgress.start ();
    }

    function done (): void {
        const wait = Math.max (0, MINIMUM_MS - (Date.now () - startedAt));

        if (hideTimer) {
            clearTimeout (hideTimer);
        }

        hideTimer = setTimeout (() => {
            NProgress.done ();
        }, wait);
    }

    const nuxtApp = useNuxtApp ();

    nuxtApp.hook ("page:start", start);
    nuxtApp.hook ("page:finish", done);
    nuxtApp.hook ("vue:error", done);
});
