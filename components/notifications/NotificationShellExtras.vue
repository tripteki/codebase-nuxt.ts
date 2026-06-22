<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, } from "vue";

import WebPushEnableBanner from "@/components/WebPushEnableBanner.vue";
import { useNotificationBroadcast, } from "@/composables/useNotificationBroadcast";
import { useNotifications, } from "@/composables/useNotifications";
import { resolveSessionUserId, } from "@/lib/session-user";

withDefaults (
    defineProps<{
        bannerTopClass?: string;
    }>(),
    {
        bannerTopClass: "top-16",
    }
);

const { refresh: refreshNotifications, } = useNotifications ();
const { subscribe, unsubscribe, } = useNotificationBroadcast ();
const { data: sessionData, status, token, } = useAuth ();
const subscribedUserId = ref<string | undefined> (undefined);
const syncingSubscription = ref (false);

async function syncNotificationSubscription (): Promise<void> {
    if (syncingSubscription.value) {
        return;
    }

    syncingSubscription.value = true;

    try {
        const userId =
            status.value === "authenticated"
                ? resolveSessionUserId (sessionData.value)
                : undefined;

        if (userId) {
            if (subscribedUserId.value === userId) {
                return;
            }

            await subscribe ();
            subscribedUserId.value = userId;

            return;
        }

        subscribedUserId.value = undefined;
        await unsubscribe ();
    } finally {
        syncingSubscription.value = false;
    }
}

onMounted (async () => {
    if (status.value === "loading" && token.value?.trim ()) {
        return;
    }

    await refreshNotifications ();
    await syncNotificationSubscription ();
});

watch (
    () => [
        status.value,
        resolveSessionUserId (sessionData.value),
        token.value,
    ],
    async () => {
        if (status.value === "loading") {
            return;
        }

        await syncNotificationSubscription ();
    }
);

onUnmounted (() => {
    void unsubscribe ();
});
</script>

<template>
    <WebPushEnableBanner :top-class="bannerTopClass" />
</template>
