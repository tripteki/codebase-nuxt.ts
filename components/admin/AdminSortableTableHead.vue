<script setup lang="ts">
import { computed, } from "vue";

import { fbAdminTableHeadCell, } from "@/lib/flowbite-classes";

const props = defineProps<{
    label: string;
    field: string;
    sort: string;
    class?: string;
}> ();

const emit = defineEmits<{
    sort: [field: string];
}> ();

const direction = computed ((): "asc" | "desc" | null => {
    if (props.sort === `${props.field}:asc`) {
        return "asc";
    }

    if (props.sort === `${props.field}:desc`) {
        return "desc";
    }

    return null;
});

const ariaSort = computed (() => {
    if (direction.value === "asc") {
        return "ascending";
    }

    if (direction.value === "desc") {
        return "descending";
    }

    return "none";
});
</script>

<template>
    <th scope="col" :class="[fbAdminTableHeadCell, 'select-none', props.class,]" :aria-sort="ariaSort">
        <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-1.5 text-left font-semibold uppercase tracking-wide text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            @click="emit ('sort', field)">
            <span>{{ label }}</span>
            <span class="inline-flex flex-col text-[10px] leading-none text-gray-400">
                <svg class="h-2.5 w-2.5" :class="direction === 'asc' ? 'text-[var(--brand-primary)]' : ''" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 0 1 .832.445l5 7a1 1 0 0 1-.832 1.555H5a1 1 0 0 1-.832-1.555l5-7A1 1 0 0 1 10 3Z" clip-rule="evenodd" />
                </svg>
                <svg class="h-2.5 w-2.5" :class="direction === 'desc' ? 'text-[var(--brand-primary)]' : ''" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 17a1 1 0 0 1-.832-.445l-5-7a1 1 0 0 1 .832-1.555h10a1 1 0 0 1 .832 1.555l-5 7A1 1 0 0 1 10 17Z" clip-rule="evenodd" />
                </svg>
            </span>
        </button>
    </th>
</template>
