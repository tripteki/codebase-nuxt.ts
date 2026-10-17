<script setup lang="ts">
import { computed, ref, watch, } from "vue";
import { useTranslation, } from "#imports";

import { cn, } from "@/lib/utils";

const props = withDefaults (defineProps<{
    id: string;
    accept?: string;
    disabled?: boolean;
    invalid?: boolean;
    modelValue?: File | null;
    selectedLabel?: string;
}> (), {
    accept: "*/*",
    disabled: false,
    invalid: false,
    modelValue: null,
    selectedLabel: undefined,
});

const emit = defineEmits<{
    "update:modelValue": [value: File | null];
}> ();

const { t, } = useTranslation ("common");
const inputRef = ref<HTMLInputElement | null> (null);

const fileLabel = computed (() => props.modelValue?.name ?? props.selectedLabel ?? t ("import_no_file"));

watch (() => props.modelValue, (value) => {
    if (! value && inputRef.value) {
        inputRef.value.value = "";
    }
});

function openPicker (): void {
    if (props.disabled) {
        return;
    }

    inputRef.value?.click ();
}

function handleChange (event: Event): void {
    const target = event.target;

    if (! (target instanceof HTMLInputElement)) {
        return;
    }

    emit ("update:modelValue", target.files?.[0] ?? null);
}

function clearInput (): void {
    if (inputRef.value) {
        inputRef.value.value = "";
    }
}

defineExpose ({
    clearInput,
});
</script>

<template>
    <div
        :class="cn (
            'flex overflow-hidden rounded-lg border bg-gray-50 dark:bg-gray-700',
            invalid ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
        )">
        <button
            type="button"
            class="btn-brand-primary shrink-0 border-e border-gray-300 px-4 py-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
            :disabled="disabled"
            @click="openPicker">
            {{ t ("import_browse") }}
        </button>
        <div class="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300" :title="fileLabel">
            <svg class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h5.086a1.5 1.5 0 0 1 1.06.44l3.914 3.914a1.5 1.5 0 0 1 .44 1.06V16.5A1.5 1.5 0 0 1 14.5 18h-9A1.5 1.5 0 0 1 4 16.5v-13Z" />
            </svg>
            <span class="truncate">{{ fileLabel }}</span>
        </div>
        <input
            :id="id"
            ref="inputRef"
            type="file"
            :accept="accept"
            class="sr-only"
            :disabled="disabled"
            @change="handleChange">
    </div>
</template>
