<script setup lang="ts">
defineProps<{
    modelValue: string;
    items: { key: string; label: string; }[];
}> ();

const emit = defineEmits<{
    "update:modelValue": [value: string];
}> ();
</script>

<template>
    <ol class="flex w-full items-center overflow-x-auto border-b border-gray-200 px-3 py-4 text-sm font-medium sm:px-6 dark:border-gray-700">
        <li
            v-for="(item, index) in items"
            :key="item.key"
            class="flex shrink-0 items-center"
            :class="index < items.length - 1 ? 'after:mx-2 after:hidden after:h-px after:w-8 after:border-b after:border-gray-200 sm:after:inline-block sm:after:w-full sm:flex-1 dark:after:border-gray-700' : ''">
            <button type="button" class="flex items-center" @click="emit ('update:modelValue', item.key)">
                <span class="me-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 sm:me-2 sm:h-8 sm:w-8 dark:bg-green-800">
                    <svg class="h-3 w-3 text-green-600 sm:h-4 sm:w-4 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </span>
                <span class="whitespace-nowrap text-xs sm:text-sm" :class="modelValue === item.key ? 'text-[var(--brand-primary)]' : 'text-gray-500 dark:text-gray-400'">
                    {{ item.label }}
                </span>
            </button>
        </li>
    </ol>
</template>
