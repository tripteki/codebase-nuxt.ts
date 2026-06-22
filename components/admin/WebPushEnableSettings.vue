<script setup lang="ts">
import { computed, } from "vue";
import { useTranslation, } from "#imports";

import { Button, } from "@/components/ui/button";
import { Spinner, } from "@/components/ui/spinner";
import { useWebPush, } from "@/composables/useWebPush";

const { t, } = useTranslation ("common");
const {
    isConfigured,
    isSupported,
    permission,
    isSubscribing,
    requestPermission,
    syncSubscription,
} = useWebPush ();

const canShowWebPush = computed (() => isConfigured.value && isSupported.value);

const statusLabel = computed (() => {
    if (permission.value === "granted") {
        return t ("webpush_status_granted");
    }

    if (permission.value === "denied") {
        return t ("webpush_status_denied");
    }

    return t ("webpush_status_default");
});
</script>

<template>
    <section v-if="canShowWebPush" class="space-y-3 rounded-lg border p-4">
        <div>
            <h3 class="text-lg font-semibold">
                {{ t ("webpush_settings_title") }}
            </h3>
            <p class="mt-1 text-sm text-muted-foreground">
                {{ t ("webpush_settings_description") }}
            </p>
        </div>

        <p class="text-sm font-medium">
            {{ statusLabel }}
        </p>

        <div class="flex flex-wrap gap-2">
            <Button
                v-if="permission !== 'granted' && permission !== 'denied'"
                type="button"
                :disabled="isSubscribing"
                @click="requestPermission">
                <Spinner v-if="isSubscribing" />
                {{ t ("webpush_enable_button") }}
            </Button>

            <Button
                v-if="permission === 'granted'"
                type="button"
                variant="outline"
                :disabled="isSubscribing"
                @click="syncSubscription">
                <Spinner v-if="isSubscribing" />
                {{ t ("webpush_sync_button") }}
            </Button>
        </div>

        <p v-if="permission === 'denied'" class="text-xs text-muted-foreground">
            {{ t ("webpush_status_denied_hint") }}
        </p>
    </section>
</template>
