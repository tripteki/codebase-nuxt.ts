import { readonly, ref, shallowRef, } from "vue";

export type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null);
const listenerAttached = ref (false);
const promptWaiters = new Set<
    (prompt: BeforeInstallPromptEvent | null) => void
>();

function notifyPromptWaiters (prompt: BeforeInstallPromptEvent | null): void {
    for (const resolve of promptWaiters) {
        resolve (prompt);
    }

    promptWaiters.clear ();
}

export function attachPwaInstallListener (): void {
    if (! import.meta.client || listenerAttached.value) {
        return;
    }

    listenerAttached.value = true;

    window.addEventListener (
        "beforeinstallprompt",
        (event) => {
            event.preventDefault ();
            const installEvent = event as BeforeInstallPromptEvent;
            deferredPrompt.value = installEvent;
            notifyPromptWaiters (installEvent);
        },
        { capture: true }
    );

    window.addEventListener ("appinstalled", () => {
        deferredPrompt.value = null;
    });
}

export function getPwaInstallPrompt (): BeforeInstallPromptEvent | null {
    return deferredPrompt.value;
}

export function clearPwaInstallPrompt (): void {
    deferredPrompt.value = null;
}

export function waitForPwaInstallPrompt (
    timeoutMs: number = 3_000
): Promise<BeforeInstallPromptEvent | null> {
    const existing = deferredPrompt.value;

    if (existing) {
        return Promise.resolve (existing);
    }

    return new Promise ((resolve) => {
        const timerId = setTimeout (() => {
            promptWaiters.delete (finish);
            resolve (deferredPrompt.value);
        }, timeoutMs);

        const finish = (prompt: BeforeInstallPromptEvent | null): void => {
            clearTimeout (timerId);
            promptWaiters.delete (finish);
            resolve (prompt ?? deferredPrompt.value);
        };

        promptWaiters.add (finish);
    });
}

export async function requestPwaInstall (): Promise<
    "accepted" | "dismissed" | "unavailable"
> {
    const prompt = deferredPrompt.value ?? (await waitForPwaInstallPrompt (0));

    if (! prompt) {
        return "unavailable";
    }

    await prompt.prompt ();
    const choice = await prompt.userChoice;
    deferredPrompt.value = null;

    return choice.outcome;
}

export function usePwaInstallPromptState () {
    return {
        deferredPrompt: readonly (deferredPrompt),
        clearPrompt: clearPwaInstallPrompt,
        getPrompt: getPwaInstallPrompt,
        waitForPrompt: waitForPwaInstallPrompt,
        requestInstall: requestPwaInstall,
    };
}

export function isStandaloneDisplay (): boolean {
    if (! import.meta.client) {
        return false;
    }

    return (
        window.matchMedia ("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean })
            .standalone === true
    );
}

export function isIosDevice (): boolean {
    if (! import.meta.client) {
        return false;
    }

    return /iPhone|iPad|iPod/i.test (navigator.userAgent);
}

export function isAndroidDevice (): boolean {
    if (! import.meta.client) {
        return false;
    }

    return /Android/i.test (navigator.userAgent);
}

export function isChromiumInstallBrowser (): boolean {
    if (! import.meta.client) {
        return false;
    }

    const userAgent = navigator.userAgent;

    return (
        /Chrome|Chromium|Edg|OPR|SamsungBrowser/i.test (userAgent) &&
        ! /Firefox|FxiOS|EdgiOS|OPiOS|CriOS.*Firefox/i.test (userAgent)
    );
}

export function supportsPwaInstallUi (): boolean {
    return isChromiumInstallBrowser () || isIosDevice () || isAndroidDevice ();
}

export async function isServiceWorkerReady (): Promise<boolean> {
    if (! import.meta.client || ! ("serviceWorker" in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration ();

        if (registration?.active) {
            return true;
        }

        if (! registration) {
            return false;
        }

        await Promise.race ([
            navigator.serviceWorker.ready,
            new Promise<null>((resolve) => {
                setTimeout (() => resolve (null), 400);
            }),
        ]);

        return Boolean (
            (await navigator.serviceWorker.getRegistration ())?.active
        );
    } catch {
        return false;
    }
}

if (import.meta.client) {
    attachPwaInstallListener ();
}
