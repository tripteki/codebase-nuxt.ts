<script setup lang="ts">
import { computed, } from "vue";
import { useTranslation, } from "#imports";

import FbButton from "@/components/flowbite/FbButton.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import { fbMuted, fbSurfacePanel, } from "@/lib/flowbite-classes";
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
    <section
        v-if="canShowWebPush"
        :class="[fbSurfacePanel, 'space-y-3 p-4']">
        <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t ("webpush_settings_title") }}
            </h3>
            <p :class="['mt-1', fbMuted]">
                {{ t ("webpush_settings_description") }}
            </p>
        </div>

        <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ statusLabel }}
        </p>

        <div class="flex flex-wrap gap-2">
            <FbButton
                v-if="permission !== 'granted' && permission !== 'denied'"
                type="button"
                :disabled="isSubscribing"
                @click="requestPermission">
                <FbSpinner v-if="isSubscribing" />
                {{ t ("webpush_enable_button") }}
            </FbButton>

            <FbButton
                v-if="permission === 'granted'"
                type="button"
                variant="outline"
                :disabled="isSubscribing"
                @click="syncSubscription">
                <FbSpinner v-if="isSubscribing" />
                {{ t ("webpush_sync_button") }}
            </FbButton>
        </div>

        <p
            v-if="permission === 'denied'"
            class="text-xs text-gray-500 dark:text-gray-400">
            {{ t ("webpush_status_denied_hint") }}
        </p>
    </section>
</template>
