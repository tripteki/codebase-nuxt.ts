<script setup lang="ts">
import { computed, } from "vue";

import NotificationShellExtras from "@/components/notifications/NotificationShellExtras.vue";

const { status, token, } = useAuth ();

const showNotificationShellExtras = computed (() => {
    if (status.value === "authenticated") {
        return true;
    }

    return status.value === "loading" && Boolean (token.value?.trim ());
});
</script>

<template>
    <VitePwaManifest />

    <ClientOnly>
        <NotificationShellExtras v-if="showNotificationShellExtras" />
    </ClientOnly>

    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
