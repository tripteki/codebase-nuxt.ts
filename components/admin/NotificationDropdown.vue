<script setup lang="ts">
import { computed, ref, watch, } from "vue";
import { useTranslation, } from "#imports";

import FbSkeleton from "@/components/flowbite/FbSkeleton.vue";
import NotificationItemPreview from "@/components/admin/NotificationItemPreview.vue";
import {
    type NotificationStatusFilter,
    useNotifications,
} from "@/composables/useNotifications";
import {
    notificationIsUnread,
    notificationTargetUrl,
} from "@/lib/notification-presenter";
import { cn, } from "@/lib/utils";

const { t, } = useTranslation ("common");
const { unread, items, fetchRecent, markAsRead, markAllAsRead, refresh, } =
    useNotifications ();

const open = ref (false);
const dropdownLoading = ref (false);
const activeTab = ref<"all" | "unread" | "read"> ("all");

const statusFilter = computed<NotificationStatusFilter> (() => {
    if (activeTab.value === "unread") {
        return "unread";
    }

    if (activeTab.value === "read") {
        return "read";
    }

    return "";
});

async function loadDropdownItems (): Promise<void> {
    dropdownLoading.value = true;

    try {
        await Promise.all ([refresh (), fetchRecent (10, statusFilter.value)]);
    } finally {
        dropdownLoading.value = false;
    }
}

watch (activeTab, () => {
    if (open.value) {
        loadDropdownItems ();
    }
});

async function toggle (): Promise<void> {
    const nextOpen = ! open.value;
    open.value = nextOpen;

    if (nextOpen) {
        await loadDropdownItems ();
    }
}

async function handleMarkAllAsRead (): Promise<void> {
    await markAllAsRead ();
    await loadDropdownItems ();
}

async function handleNotificationClick (id: string): Promise<void> {
    const item = items.value.find ((entry) => entry.id === id);
    const targetUrl = item ? notificationTargetUrl (item) : null;

    await markAsRead (id);
    open.value = false;

    if (targetUrl) {
        await navigateTo (targetUrl, {
            external: targetUrl.startsWith ("http"),
            open: { target: "_blank" },
        });
    }
}

function tabClass (tab: "all" | "unread" | "read"): string {
    return cn (
        "inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium leading-none transition-colors",
        activeTab.value === tab
            ? "nav-pill-brand-active"
            : "nav-pill-brand-inactive text-gray-600 dark:text-gray-400"
    );
}
</script>

<template>
    <div class="relative">
        <button
            type="button"
            class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-gray-700"
            :aria-expanded="open"
            :aria-label="t ('notifications')"
            @click.stop="toggle">
            <svg
                v-if="unread > 0"
                class="notification-bell-icon"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M17.133 12.632v-1.8a5.406 5.406 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.955.955 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175ZM6 6a1 1 0 0 1-.707-.293l-1-1a1 1 0 0 1 1.414-1.414l1 1A1 1 0 0 1 6 6Zm-2 4H3a1 1 0 0 1 0-2h1a1 1 0 1 1 0 2Zm14-4a1 1 0 0 1-.707-1.707l1-1a1 1 0 1 1 1.414 1.414l-1 1A1 1 0 0 1 18 6Zm3 4h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z" />
            </svg>
            <svg
                v-else
                class="notification-bell-outline"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z" />
            </svg>
            <span
                v-if="unread > 0"
                class="notification-dot absolute end-1 top-1 h-2.5 w-2.5 translate-x-[35%] -translate-y-[35%] rounded-full shadow-[0_0_0_2px_white] dark:shadow-[0_0_0_2px_#1f2937]"
                aria-hidden="true" />
        </button>

        <div
            v-if="open"
            class="z-50 flex max-h-[460px] flex-col rounded-[14px] border border-gray-200 bg-white text-sm shadow-lg max-lg:fixed max-lg:left-1/2 max-lg:top-[3.5rem] max-lg:w-[calc(100vw-1.5rem)] max-lg:min-w-0 max-lg:max-w-[360px] max-lg:-translate-x-1/2 lg:absolute lg:end-0 lg:top-12 lg:w-80 lg:min-w-[320px] lg:max-w-[360px] lg:translate-x-0 dark:border-gray-600 dark:bg-gray-800"
            @click.stop>
            <div class="sticky top-0 z-10 shrink-0 rounded-t-[14px] border-b border-gray-200 bg-white px-2 py-2 dark:border-gray-600 dark:bg-gray-800">
                <div class="flex items-center justify-between px-2 pb-2">
                    <span class="font-semibold text-gray-900 dark:text-white">
                        {{ t ("notifications") }}
                    </span>
                    <button
                        v-if="unread > 0"
                        type="button"
                        class="link-brand-primary inline-flex cursor-pointer items-center gap-1 text-xs"
                        @click="handleMarkAllAsRead">
                        <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ t ("mark_all_read") }}
                    </button>
                </div>
                <div
                    class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700"
                    role="tablist"
                    :aria-label="t ('notifications')">
                    <button type="button" role="tab" :aria-selected="activeTab === 'all'" :class="tabClass ('all')" @click="activeTab = 'all'">
                        {{ t ("all") }}
                    </button>
                    <button type="button" role="tab" :aria-selected="activeTab === 'unread'" :class="tabClass ('unread')" @click="activeTab = 'unread'">
                        {{ t ("notifications_tab_new") }}
                    </button>
                    <button type="button" role="tab" :aria-selected="activeTab === 'read'" :class="tabClass ('read')" @click="activeTab = 'read'">
                        {{ t ("read") }}
                    </button>
                </div>
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto py-1" role="tabpanel">
                <div v-if="dropdownLoading" class="space-y-3 px-4 py-4">
                    <FbSkeleton v-for="row in 4" :key="row" class-name="h-10 w-full" />
                </div>
                <div v-else-if="items.length === 0" class="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    {{ t ("no_notifications") }}
                </div>
                <button
                    v-for="item in items"
                    v-else
                    :key="item.id"
                    type="button"
                    :class="cn (
                        'relative mx-1.5 mb-1 flex w-[calc(100%-0.75rem)] cursor-pointer items-start gap-3 rounded-lg px-3.5 py-2.5 text-start transition-colors',
                        notificationIsUnread (item)
                            ? 'surface-brand-soft pe-5'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    )"
                    @click="handleNotificationClick (item.id)">
                    <span
                        v-if="notificationIsUnread (item)"
                        class="notification-dot pointer-events-none absolute end-2 top-2 h-2 w-2 rounded-full"
                        aria-hidden="true" />
                    <NotificationItemPreview :item="item" />
                </button>
            </div>
            <div class="sticky bottom-0 z-10 shrink-0 rounded-b-[14px] border-t border-gray-200 bg-white pb-2 pt-1 text-center dark:border-gray-600 dark:bg-gray-800">
                <NuxtLink
                    to="/notifications"
                    class="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    @click="open = false">
                    {{ t ("view_all_notifications") }}
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
