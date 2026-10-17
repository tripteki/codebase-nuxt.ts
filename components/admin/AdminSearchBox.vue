<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, } from "vue";
import { navigateTo, useTranslation, } from "#imports";

import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminSearch, } from "@/composables/useAdminSearch";
import { ADMIN_SEARCH_CATEGORIES, type AdminSearchCategory, } from "@/lib/admin-search-categories";
import { fbMuted, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";
import type { AdminSearchResult, } from "@/types/admin/search";

const props = withDefaults (defineProps<{
    variant?: "desktop" | "sidebar";
}> (), {
    variant: "desktop",
});

const { t, } = useTranslation ("common");
const isSidebar = computed (() => props.variant === "sidebar");
const { can, loaded, } = useAdminAccesses ();
const { search, } = useAdminSearch ();
const rootRef = ref<HTMLElement | null> (null);
const query = ref ("");
const category = ref<AdminSearchCategory> ("all");
const categoryOpen = ref (false);
const open = ref (false);
const searching = ref (false);
const result = ref<AdminSearchResult | null> (null);
let timer: ReturnType<typeof setTimeout> | undefined;

const categories = computed (() =>
    ADMIN_SEARCH_CATEGORIES.filter ((item) => ! item.permission || can (item.permission))
);
const hasSearchAccess = computed (() =>
    ! loaded.value || categories.value.some ((item) => item.key !== "all")
);
const categoryLabel = computed (() =>
    category.value === "all" ? t ("search_category_all") : t (category.value)
);
const groups = computed (() =>
    (result.value?.results ?? []).filter ((group) => group.items.length > 0)
);

function optionClass (key: AdminSearchCategory): string {
    return cn (
        "block w-full cursor-pointer px-4 py-2 text-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
        category.value === key && "bg-gray-50 font-medium dark:bg-gray-700"
    );
}

function categoryOptionLabel (key: AdminSearchCategory): string {
    return key === "all" ? t ("search_category_all") : t (key);
}

function closeMenus (): void {
    categoryOpen.value = false;
    open.value = false;
}

function onDocumentClick (event: MouseEvent): void {
    const target = event.target;

    if (! (target instanceof Node) || ! rootRef.value?.contains (target)) {
        closeMenus ();
    }
}

function toggleCategory (): void {
    categoryOpen.value = ! categoryOpen.value;

    if (categoryOpen.value) {
        open.value = false;
    }
}

function selectCategory (key: AdminSearchCategory): void {
    category.value = key;
    categoryOpen.value = false;

    if (query.value.trim ().length >= 2) {
        open.value = true;
    }
}

function openResults (): void {
    categoryOpen.value = false;
    open.value = true;
}

function clearQuery (): void {
    query.value = "";
    result.value = null;
}

function submit (): void {
    const q = query.value.trim ();

    if (q.length < 2) {
        return;
    }

    closeMenus ();
    void navigateTo ({ path: "/admin/search", query: { q, category: category.value, }, });
}

watch ([query, category], () => {
    if (timer) {
        clearTimeout (timer);
    }

    const q = query.value.trim ();

    if (q.length < 2) {
        result.value = null;
        searching.value = false;

        return;
    }

    open.value = true;
    searching.value = true;
    timer = setTimeout (async () => {
        const response = await search (q, category.value);
        searching.value = false;

        if (! response.isSuccess) {
            result.value = null;

            return;
        }

        result.value = response.data as AdminSearchResult;
    }, 300);
});

onMounted (() => {
    document.addEventListener ("click", onDocumentClick);
});

onBeforeUnmount (() => {
    document.removeEventListener ("click", onDocumentClick);

    if (timer) {
        clearTimeout (timer);
    }
});
</script>

<template>
    <div
        v-if="hasSearchAccess"
        ref="rootRef"
        :class="isSidebar ? 'relative w-full min-w-0 lg:hidden' : 'relative hidden min-w-0 flex-1 sm:block sm:max-w-md lg:max-w-xl'">
        <form class="focus-within-brand flex items-stretch -space-x-px rounded-lg shadow-sm focus-within:ring-2" role="search" @submit.prevent="submit">
            <div v-if="! isSidebar" class="relative flex shrink-0 items-stretch">
                <button
                    type="button"
                    data-test="search-category-toggle"
                    class="inline-flex h-full shrink-0 cursor-pointer items-center rounded-s-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium leading-5 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    :aria-expanded="categoryOpen"
                    :aria-label="t ('search')"
                    @click.stop="toggleCategory">
                    <span class="max-w-[7rem] truncate">{{ categoryLabel }}</span>
                    <svg class="ms-1.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
                    </svg>
                </button>
                <div
                    v-show="categoryOpen"
                    data-test="search-category-menu"
                    class="absolute start-0 top-[calc(100%+8px)] z-[60] w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800">
                    <button
                        v-for="item in categories"
                        :key="item.key"
                        type="button"
                        data-test="search-category-option"
                        :class="optionClass (item.key)"
                        @click.stop="selectCategory (item.key)">
                        {{ categoryOptionLabel (item.key) }}
                    </button>
                </div>
            </div>
            <div class="relative flex min-w-0 flex-1 items-stretch">
                <label class="sr-only" :for="isSidebar ? 'admin-sidebar-search' : 'admin-global-search'">{{ t ("search") }}</label>
                <input
                    :id="isSidebar ? 'admin-sidebar-search' : 'admin-global-search'"
                    v-model="query"
                    data-test="admin-search-input"
                    type="search"
                    :class="isSidebar
                        ? 'block h-full w-full min-w-0 rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/60 focus:outline-none'
                        : 'block h-full w-full min-w-0 rounded-none border border-gray-300 border-s-0 bg-gray-50 px-3 py-2.5 text-sm leading-5 text-gray-900 placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-gray-600'"
                    :placeholder="t ('search_placeholder')"
                    autocomplete="off"
                    @focus="openResults"
                    @click.stop="openResults">
                <button
                    v-if="query.length > 0"
                    type="button"
                    class="absolute inset-y-0 end-0 flex cursor-pointer items-center pe-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    :aria-label="t ('search_clear')"
                    @click.stop="clearQuery">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <button
                v-if="! isSidebar"
                type="submit"
                class="btn-brand-primary inline-flex shrink-0 cursor-pointer items-center rounded-e-lg px-4 py-2.5 text-sm font-medium leading-5 focus:outline-none focus:ring-0">
                <img src="/manifest/asset/icon-search.svg" alt="" class="me-1.5 h-4 w-4 shrink-0 object-contain brightness-0 invert" width="16" height="16">
                {{ t ("search") }}
            </button>
        </form>
        <div
            v-show="open"
            data-test="admin-search-results"
            class="absolute start-0 end-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <p v-if="searching" :class="[fbMuted, 'px-4 py-4 text-center']">{{ t ("loading") }}</p>
            <p v-else-if="query.trim ().length < 2" :class="[fbMuted, 'px-4 py-4 text-center']">{{ t ("search_min_chars") }}</p>
            <p v-else-if="groups.length === 0" :class="[fbMuted, 'px-4 py-4 text-center']">{{ t ("search_not_found") }}</p>
            <div v-else class="divide-y divide-gray-100 dark:divide-gray-600">
                <section v-for="group in groups" :key="group.category">
                    <div class="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {{ t (group.category) }}
                    </div>
                    <NuxtLink
                        v-for="item in group.items"
                        :key="`${group.category}-${item.id}`"
                        class="block truncate px-4 py-3 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        :to="item.url"
                        @click="closeMenus">
                        {{ item.title }}
                    </NuxtLink>
                </section>
            </div>
        </div>
    </div>
</template>
