<script setup lang="ts">
import { useTranslation, } from "#imports";

import { fbMuted, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

withDefaults (defineProps<{
    open: boolean;
    title: string;
    titleId: string;
    description?: string;
    processing?: boolean;
}> (), {
    processing: false,
});

const emit = defineEmits<{
    "update:open": [value: boolean];
}> ();

const { t, } = useTranslation ("common");

function close (): void {
    emit ("update:open", false);
}
</script>

<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            @click.self="close">
            <div
                class="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800"
                @click.stop>
                <div class="flex items-start justify-between border-b border-gray-200 p-4 md:p-5 dark:border-gray-600">
                    <div class="min-w-0 flex-1 pe-4">
                        <h3 :id="titleId" class="text-lg font-semibold text-gray-900 dark:text-white">
                            {{ title }}
                        </h3>
                        <p v-if="description" :class="cn (fbMuted, 'mt-1 text-sm')">
                            {{ description }}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                        :disabled="processing"
                        @click="close">
                        <span class="sr-only">{{ t ("modal_close") }}</span>
                        <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
                <div class="min-h-0 overflow-y-auto p-4 md:p-5">
                    <slot />
                </div>
            </div>
        </div>
    </Teleport>
</template>
