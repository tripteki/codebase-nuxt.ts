import { defineNuxtPlugin, } from "#imports";

import {
    resolveServiceWorkerRegistration,
    urlBase64ToUint8Array,
} from "@/lib/web-push";

export default defineNuxtPlugin ({
    name: "vite-pwa:codebase-web-push",
    enforce: "post",
    setup (nuxtApp) {
        if (! import.meta.client || ! ("serviceWorker" in navigator)) {
            return {
                provide: {
                    requestPushPermission: async () =>
                        Promise.reject (new Error ("Web Push not supported.")),
                    syncWebPushSubscription: async () =>
                        Promise.reject (new Error ("Web Push not supported.")),
                },
            };
        }

        const config = useRuntimeConfig ();
        const vapidPublicKey = String (
            config.public.vapidPublicKey ?? ""
        ).trim ();

        let registration: ServiceWorkerRegistration | null = null;
        let registrationPromise: Promise<ServiceWorkerRegistration> | null =
            null;

        type PwaModule = {
            getSWRegistration?: () => ServiceWorkerRegistration | undefined;
            registrationError?: boolean;
        };

        function getPwaModule (): PwaModule | undefined {
            return nuxtApp.$pwa as PwaModule | undefined;
        }

        function getPwaRegistration (): ServiceWorkerRegistration | undefined {
            return getPwaModule ()?.getSWRegistration?.();
        }

        function hasRegistrationFailed (): boolean {
            return Boolean (getPwaModule ()?.registrationError);
        }

        function waitForRegistration (): Promise<ServiceWorkerRegistration> {
            if (registration) {
                return Promise.resolve (registration);
            }

            if (! registrationPromise) {
                registrationPromise = resolveServiceWorkerRegistration ({
                    getPwaRegistration,
                    registrationFailed: hasRegistrationFailed,
                    onRegistered: (callback) => {
                        nuxtApp.hooks.hook (
                            "service-worker:registered",
                            callback
                        );
                    },
                    offRegistered: (callback) => {
                        nuxtApp.hooks.removeHook (
                            "service-worker:registered",
                            callback
                        );
                    },
                })
                    .then ((serviceWorkerRegistration) => {
                        registration = serviceWorkerRegistration;
                        return serviceWorkerRegistration;
                    })
                    .finally (() => {
                        registrationPromise = null;
                    });
            }

            return registrationPromise;
        }

        function getVapidPublicKey (): string | null {
            return vapidPublicKey || null;
        }

        async function postSubscriptionToServer (
            subscription: PushSubscription
        ): Promise<void> {
            const { token, } = useAuth ();
            const accessToken = token.value;

            if (! accessToken) {
                throw new Error ("Unauthenticated.");
            }

            await $fetch ("/api/webpush/subscribe", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: subscription.toJSON (),
            });
        }

        async function obtainPushSubscription (
            serviceWorkerRegistration: ServiceWorkerRegistration
        ): Promise<PushSubscription | null> {
            const key = getVapidPublicKey ();

            if (! key) {
                return null;
            }

            const existing =
                await serviceWorkerRegistration.pushManager.getSubscription ();

            if (existing) {
                return existing;
            }

            return serviceWorkerRegistration.pushManager.subscribe ({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array (
                    key
                ) as BufferSource,
            });
        }

        async function ensurePushSubscription (
            serviceWorkerRegistration: ServiceWorkerRegistration
        ): Promise<void> {
            if (! ("Notification" in window) || ! ("PushManager" in window)) {
                return;
            }

            if (! getVapidPublicKey ()) {
                return;
            }

            if (Notification.permission !== "granted") {
                return;
            }

            const subscription = await obtainPushSubscription (
                serviceWorkerRegistration
            );

            if (! subscription) {
                return;
            }

            await postSubscriptionToServer (subscription);
            document.dispatchEvent (new CustomEvent ("webpush:subscribed"));
        }

        async function requestPushPermission (): Promise<void> {
            if (! ("Notification" in window) || ! ("PushManager" in window)) {
                throw new Error ("Web Push not supported.");
            }

            if (! getVapidPublicKey ()) {
                throw new Error ("VAPID key not configured.");
            }

            const serviceWorkerRegistration = await waitForRegistration ();

            if (Notification.permission === "denied") {
                throw new Error ("Permission denied.");
            }

            if (Notification.permission === "granted") {
                await ensurePushSubscription (serviceWorkerRegistration);

                return;
            }

            const permission = await Notification.requestPermission ();

            if (permission !== "granted") {
                throw new Error ("Permission not granted.");
            }

            await ensurePushSubscription (serviceWorkerRegistration);
        }

        async function syncWebPushSubscription (): Promise<void> {
            const serviceWorkerRegistration = await waitForRegistration ();
            await ensurePushSubscription (serviceWorkerRegistration);
        }

        void waitForRegistration ()
            .then ((serviceWorkerRegistration) => {
                if (Notification.permission === "granted") {
                    void ensurePushSubscription (serviceWorkerRegistration);
                }
            })
            .catch (() => {
                //
            });

        return {
            provide: {
                requestPushPermission,
                syncWebPushSubscription,
            },
        };
    },
});
