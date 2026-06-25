<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbButton from "@/components/flowbite/FbButton.vue";
import { useWebPush, } from "@/composables/useWebPush";

withDefaults (
    defineProps<{
        topClass?: string;
    }>(),
    {
        topClass: "top-16",
    }
);

const { t, } = useTranslation ("common");
const { showBanner, isSubscribing, dismissBanner, requestPermission, } =
    useWebPush ();
</script>

<template>
    <div
        v-if="showBanner"
        class="fixed left-4 right-4 z-40 sm:left-auto sm:right-6 sm:max-w-md"
        :class="topClass"
        role="region"
        :aria-label="t ('webpush_enable_title')">
        <div
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-50">
            <div class="min-w-0 flex-1">
                <p class="font-semibold">
                    {{ t ("webpush_enable_title") }}
                </p>
                <p class="mt-0.5 text-xs opacity-90">
                    {{ t ("webpush_enable_hint") }}
                </p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
                <FbButton
                    type="button"
                    size="sm"
                    :disabled="isSubscribing"
                    @click="requestPermission">
                    {{ t ("webpush_enable_button") }}
                </FbButton>

                <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs opacity-70 hover:opacity-100"
                    :aria-label="t ('close')"
                    @click="dismissBanner">
                    {{ t ("close") }}
                </button>
            </div>
        </div>
    </div>
</template>
