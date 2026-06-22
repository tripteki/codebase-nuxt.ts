declare module "#app" {
    interface NuxtApp {
        $requestPushPermission: () => Promise<void>;
        $syncWebPushSubscription: () => Promise<void>;
    }
}

export {};
