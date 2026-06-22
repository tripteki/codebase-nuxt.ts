/// <reference lib="webworker" />
/// <reference types="vite-plugin-pwa/client" />

import { clientsClaim, } from "workbox-core";
import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute, } from "workbox-routing";

import { PWA_NAVIGATION_DENYLIST, } from "../lib/pwa-navigation-denylist";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener ("push", (event: PushEvent) => {
    if (! event.data) {
        return;
    }

    let data: Record<string, unknown> = {};

    try {
        data = event.data.json () as Record<string, unknown>;
    } catch {
        data = {};
    }

    const title = String (data.title ?? "Notification");
    const body = String (data.body ?? "");

    event.waitUntil (
        self.registration.showNotification (title, {
            body,
            icon: String (data.icon ?? "/manifest/icon-512x512.png"),
            badge: String (data.badge ?? "/manifest/icon-192x192.png"),
            data: (data.data as Record<string, unknown> | undefined) ?? data,
        })
    );
});

self.addEventListener ("notificationclick", (event: NotificationEvent) => {
    event.notification.close ();

    const data = (event.notification.data ?? {}) as Record<string, unknown>;
    const url = String (data.url ?? data.action ?? "/");
    const targetHref = new URL (url, self.location.origin).href;

    event.waitUntil (
        self.clients
            .matchAll ({ type: "window", includeUncontrolled: true })
            .then ((clientList) => {
                for (const client of clientList) {
                    if (client.url === targetHref && "focus" in client) {
                        return client.focus ();
                    }
                }

                if (self.clients.openWindow) {
                    return self.clients.openWindow (targetHref);
                }
            })
    );
});

precacheAndRoute (self.__WB_MANIFEST);
cleanupOutdatedCaches ();
registerRoute (
    new NavigationRoute (createHandlerBoundToURL ("/"), {
        denylist: PWA_NAVIGATION_DENYLIST,
    })
);
clientsClaim ();
self.skipWaiting ();
