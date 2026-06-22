import { computed, onMounted, onUnmounted, ref, } from "vue";

import { isWebPushSupported, } from "@/lib/web-push";

const DISMISS_KEY = "webpush-enable-banner-dismissed";

export function useWebPush () {
    const config = useRuntimeConfig ();
    const { token, status, } = useAuth ();
    const nuxtApp = useNuxtApp ();

    const vapidPublicKey = computed (() =>
        String (config.public.vapidPublicKey ?? "").trim ()
    );
    const isConfigured = computed (() => vapidPublicKey.value.length > 0);
    const permission = ref<NotificationPermission>("default");
    const isSubscribing = ref (false);
    const isClientReady = ref (false);
    const bannerDismissed = ref (false);

    const isSupported = computed (() =>
        isWebPushSupported (vapidPublicKey.value)
    );

    const isAuthenticated = computed (() => status.value === "authenticated");

    const showBanner = computed (
        () =>
            isConfigured.value &&
            isAuthenticated.value &&
            isClientReady.value &&
            isSupported.value &&
            permission.value === "default" &&
            ! bannerDismissed.value
    );

    function refreshPermission (): void {
        if (! import.meta.client || ! ("Notification" in window)) {
            return;
        }

        permission.value = Notification.permission;
    }

    function dismissBanner (): void {
        bannerDismissed.value = true;

        try {
            window.localStorage.setItem (DISMISS_KEY, "1");
        } catch {
            //
        }
    }

    async function requestPermission (): Promise<void> {
        if (! isSupported.value) {
            return;
        }

        const requestPushPermission = nuxtApp.$requestPushPermission as
            | (() => Promise<void>)
            | undefined;

        if (! requestPushPermission) {
            return;
        }

        isSubscribing.value = true;

        try {
            await requestPushPermission ();
            refreshPermission ();
        } catch (error) {
            console.error ("Web push permission request failed:", error);
        } finally {
            isSubscribing.value = false;
        }
    }

    async function syncSubscription (): Promise<void> {
        if (! isSupported.value) {
            return;
        }

        const syncWebPushSubscription = nuxtApp.$syncWebPushSubscription as
            | (() => Promise<void>)
            | undefined;

        if (! syncWebPushSubscription) {
            return;
        }

        isSubscribing.value = true;

        try {
            await syncWebPushSubscription ();
            refreshPermission ();
        } finally {
            isSubscribing.value = false;
        }
    }

    onMounted (() => {
        isClientReady.value = true;

        try {
            bannerDismissed.value =
                window.localStorage.getItem (DISMISS_KEY) === "1";
        } catch {
            bannerDismissed.value = false;
        }

        refreshPermission ();

        if (! import.meta.client) {
            return;
        }

        document.addEventListener ("webpush:subscribed", refreshPermission);
    });

    onUnmounted (() => {
        if (! import.meta.client) {
            return;
        }

        document.removeEventListener ("webpush:subscribed", refreshPermission);
    });

    return {
        vapidPublicKey,
        isConfigured,
        isSupported,
        permission,
        showBanner,
        isSubscribing,
        dismissBanner,
        requestPermission,
        syncSubscription,
        refreshPermission,
        accessToken: token,
    };
}
