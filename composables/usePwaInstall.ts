import { computed, onMounted, onUnmounted, ref, } from "vue";

import {
    clearPwaInstallPrompt,
    isAndroidDevice,
    isChromiumInstallBrowser,
    isIosDevice,
    isServiceWorkerReady,
    isStandaloneDisplay,
    requestPwaInstall,
    supportsPwaInstallUi,
    usePwaInstallPromptState,
    waitForPwaInstallPrompt,
} from "@/lib/pwa-install";

const DISMISS_KEY = "pwa-install-dismissed";
const SW_POLL_INTERVAL_MS = 500;
const SW_POLL_MAX_ATTEMPTS = 6;

function wasDismissed (): boolean {
    try {
        return (
            window.localStorage.getItem (DISMISS_KEY) === "true" ||
            window.localStorage.getItem (DISMISS_KEY) === "1"
        );
    } catch {
        return false;
    }
}

export function usePwaInstall () {
    const nuxtApp = useNuxtApp ();
    const { deferredPrompt, } = usePwaInstallPromptState ();
    const { t, } = useTranslation ("common");
    const isClientReady = ref (false);
    const isInstalling = ref (false);
    const serviceWorkerReady = ref (false);
    const fallbackVisible = ref (false);

    let pollId: ReturnType<typeof setInterval> | undefined;
    let fallbackTimerId: ReturnType<typeof setTimeout> | undefined;
    let pollAttempts = 0;

    const canInstall = computed (() => Boolean (deferredPrompt.value));

    const visible = computed (
        () =>
            isClientReady.value &&
            (serviceWorkerReady.value || fallbackVisible.value) &&
            supportsPwaInstallUi () &&
            ! isStandaloneDisplay () &&
            ! wasDismissed ()
    );

    function dismiss (): void {
        clearPwaInstallPrompt ();

        try {
            window.localStorage.setItem (DISMISS_KEY, "true");
        } catch {
            //
        }
    }

    function showManualInstallHelp (): void {
        if (isIosDevice ()) {
            useToastify (t ("pwa_install_manual_ios"), {
                type: "info",
                autoClose: 8000,
            });

            return;
        }

        if (isAndroidDevice ()) {
            useToastify (t ("pwa_install_manual_android"), {
                type: "info",
                autoClose: 8000,
            });

            return;
        }

        useToastify (t ("pwa_install_manual_chrome"), {
            type: "info",
            autoClose: 8000,
        });
    }

    async function install (): Promise<void> {
        if (isInstalling.value) {
            return;
        }

        isInstalling.value = true;

        try {
            if (! deferredPrompt.value) {
                await waitForPwaInstallPrompt (2_000);
            }

            if (deferredPrompt.value) {
                const outcome = await requestPwaInstall ();

                if (outcome === "dismissed") {
                    useToastify (t ("pwa_install_dismissed"), { type: "info" });
                }

                return;
            }

            showManualInstallHelp ();
        } catch (error) {
            console.error ("PWA install failed:", error);

            if (isChromiumInstallBrowser ()) {
                showManualInstallHelp ();

                return;
            }

            useToastify (t ("pwa_install_failed"), { type: "error" });
        } finally {
            isInstalling.value = false;
        }
    }

    function stopServiceWorkerPoll (): void {
        if (pollId !== undefined) {
            clearInterval (pollId);
            pollId = undefined;
        }
    }

    function markServiceWorkerReady (): void {
        serviceWorkerReady.value = true;
        stopServiceWorkerPoll ();
    }

    function refreshServiceWorkerState (): void {
        pollAttempts += 1;

        if (pollAttempts > SW_POLL_MAX_ATTEMPTS) {
            stopServiceWorkerPoll ();
            return;
        }

        void isServiceWorkerReady ().then ((ready) => {
            if (ready) {
                markServiceWorkerReady ();
            }
        });
    }

    onMounted (() => {
        isClientReady.value = true;
        refreshServiceWorkerState ();
        pollId = setInterval (refreshServiceWorkerState, SW_POLL_INTERVAL_MS);
        fallbackTimerId = setTimeout (() => {
            fallbackVisible.value = true;
            stopServiceWorkerPoll ();
        }, 3_000);

        nuxtApp.hooks.hook ("service-worker:activated", markServiceWorkerReady);
        nuxtApp.hooks.hook (
            "service-worker:registered",
            refreshServiceWorkerState
        );
    });

    onUnmounted (() => {
        stopServiceWorkerPoll ();

        if (fallbackTimerId !== undefined) {
            clearTimeout (fallbackTimerId);
        }

        nuxtApp.hooks.removeHook (
            "service-worker:activated",
            markServiceWorkerReady
        );
        nuxtApp.hooks.removeHook (
            "service-worker:registered",
            refreshServiceWorkerState
        );
    });

    return {
        visible,
        canInstall,
        isInstalling,
        dismiss,
        install,
    };
}
