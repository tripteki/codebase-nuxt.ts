<script setup lang="ts">
import { computed, } from "vue";
import { useTranslation, } from "#imports";

import { paginationRange, } from "@/lib/pagination-range";
import { cn, } from "@/lib/utils";
import type { PaginatedMeta, } from "@/types/admin/api";

const props = defineProps<{
    meta?: PaginatedMeta;
    page: number;
    itemCount?: number;
}> ();

const emit = defineEmits<{
    change: [page: number];
}> ();

const { t, } = useTranslation ("common");
const lastPage = computed (() => props.meta?.last_page ?? 1);
const pages = computed (() => paginationRange (props.page, lastPage.value));
const summary = computed (() => {
    const total = props.meta?.total;
    const from = props.meta?.from;
    const to = props.meta?.to;

    if (typeof total !== "number" || typeof from !== "number" || typeof to !== "number") {
        return null;
    }

    return { from, to, total, };
});

const pageButtonClass =
    "relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out hover:text-gray-500 focus:z-10 focus:border-[color-mix(in_srgb,var(--brand-primary)_35%,#e5e7eb_65%)] focus:outline-none active:bg-gray-100 active:text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600";

const edgeButtonClass =
    "relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium leading-5 text-gray-500 transition duration-150 ease-in-out hover:text-gray-400 focus:z-10 focus:border-[color-mix(in_srgb,var(--brand-primary)_35%,#e5e7eb_65%)] focus:outline-none active:bg-gray-100 active:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600";

const disabledEdgeClass =
    "relative inline-flex cursor-default items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium leading-5 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

function goTo (page: number): void {
    const next = Math.min (Math.max (1, page), lastPage.value);

    if (next === props.page) {
        return;
    }

    emit ("change", next);
}
</script>

<template>
    <div
        v-if="summary || lastPage > 1"
        class="mt-4 flex flex-col gap-4 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 md:px-6">
        <p
            v-if="summary"
            class="shrink-0 text-sm leading-5 text-gray-700 dark:text-white">
            {{ t ("table_pagination", summary) }}
        </p>
        <nav
            v-if="lastPage > 1"
            class="ms-auto inline-flex max-w-full shrink-0 overflow-x-auto rounded-md shadow-sm"
            :aria-label="t ('aria_pagination')">
            <span class="relative z-0 inline-flex min-w-max rounded-md shadow-sm">
                <button
                    v-if="page <= 1"
                    type="button"
                    disabled
                    :class="cn (disabledEdgeClass, 'rounded-l-md')"
                    :aria-label="t ('previous')">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0Z" clip-rule="evenodd" />
                    </svg>
                </button>
                <button
                    v-else
                    type="button"
                    :class="cn (edgeButtonClass, 'rounded-l-md')"
                    :aria-label="t ('previous')"
                    @click="goTo (page - 1)">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0Z" clip-rule="evenodd" />
                    </svg>
                </button>
                <template v-for="(item, index) in pages" :key="`${item}-${index}`">
                    <span
                        v-if="item === '...'"
                        class="relative -ml-px inline-flex cursor-default items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        ...
                    </span>
                    <span
                        v-else-if="item === page"
                        aria-current="page"
                        class="relative -ml-px inline-flex cursor-default items-center border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium leading-5 text-gray-500 dark:border-gray-500 dark:bg-gray-500 dark:text-white">
                        {{ item }}
                    </span>
                    <button
                        v-else
                        type="button"
                        :class="cn (pageButtonClass, '-ml-px')"
                        :aria-label="t ('table_go_to_page', { page: item, })"
                        @click="goTo (item)">
                        {{ item }}
                    </button>
                </template>
                <button
                    v-if="page >= lastPage"
                    type="button"
                    disabled
                    :class="cn (disabledEdgeClass, '-ml-px rounded-r-md')"
                    :aria-label="t ('next')">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" clip-rule="evenodd" />
                    </svg>
                </button>
                <button
                    v-else
                    type="button"
                    :class="cn (edgeButtonClass, '-ml-px rounded-r-md')"
                    :aria-label="t ('next')"
                    @click="goTo (page + 1)">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" clip-rule="evenodd" />
                    </svg>
                </button>
            </span>
        </nav>
    </div>
</template>
