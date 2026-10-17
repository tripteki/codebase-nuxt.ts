<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbButton from "@/components/flowbite/FbButton.vue";

withDefaults (defineProps<{
    open: boolean;
    title: string;
    titleId: string;
    message: string;
    confirmLabel: string;
    processing?: boolean;
    danger?: boolean;
}> (), {
    processing: false,
    danger: false,
});

const emit = defineEmits<{
    "update:open": [value: boolean];
    confirm: [];
}> ();

const { t, } = useTranslation ("common");
</script>

<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            @click.self="emit ('update:open', false)">
            <div class="w-full max-w-md rounded-lg bg-white shadow dark:bg-gray-800" @click.stop>
                <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-600">
                    <h3 :id="titleId" class="text-lg font-semibold">{{ title }}</h3>
                    <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                        :disabled="processing"
                        @click="emit ('update:open', false)">
                        <span class="sr-only">{{ t ("modal_close") }}</span>
                        <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
                <p class="p-4 text-sm">{{ message }}</p>
                <div class="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-600">
                    <FbButton variant="outline" type="button" :disabled="processing" @click="emit ('update:open', false)">{{ t ("cancel") }}</FbButton>
                    <FbButton type="button" :variant="danger ? 'danger' : 'primary'" :disabled="processing" @click="emit ('confirm')">{{ confirmLabel }}</FbButton>
                </div>
            </div>
        </div>
    </Teleport>
</template>
