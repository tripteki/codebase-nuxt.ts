<script setup lang="ts">
import { computed, ref, watch, } from "vue";
import { useTranslation, } from "#imports";

import NotificationItemPreview from "@/components/admin/NotificationItemPreview.vue";
import {
    type NotificationStatusFilter,
    useNotifications,
} from "@/composables/useNotifications";
import {
    notificationIsUnread,
    notificationTargetUrl,
} from "@/lib/notification-presenter";
import { Button, } from "@/components/ui/button";
import { cn, } from "@/lib/utils";

const { t, } = useTranslation ("common");
const { unread, items, fetchRecent, markAsRead, markAllAsRead, refresh, } =
    useNotifications ();

const open = ref (false);
const dropdownLoading = ref (false);
const activeTab = ref<"all" | "unread" | "read">("all");

const statusFilter = computed<NotificationStatusFilter>(() => {
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
        "inline-flex flex-1 items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        activeTab.value === tab
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
    );
}
</script>

<template>
    <div class="relative">
        <Button
            type="button"
            variant="ghost"
            size="icon"
            class="relative"
            :aria-expanded="open"
            :aria-label="t ('notifications')"
            @click.stop="toggle">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span
                v-if="unread > 0"
                class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {{ unread > 99 ? "99+" : unread }}
            </span>
        </Button>

        <div
            v-if="open"
            class="absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-popover text-popover-foreground shadow-lg">
            <div class="flex items-center justify-between border-b px-4 py-3">
                <h3 class="text-sm font-semibold">
                    {{ t ("notifications") }}
                </h3>
                <Button
                    v-if="unread > 0"
                    variant="ghost"
                    size="sm"
                    class="h-auto px-2 py-1 text-xs"
                    @click="handleMarkAllAsRead">
                    {{ t ("mark_all_read") }}
                </Button>
            </div>

            <div class="flex gap-1 border-b px-2 py-2">
                <button
                    type="button"
                    :class="tabClass ('all')"
                    @click="activeTab = 'all'">
                    {{ t ("all") }}
                </button>
                <button
                    type="button"
                    :class="tabClass ('unread')"
                    @click="activeTab = 'unread'">
                    {{ t ("unread") }}
                </button>
                <button
                    type="button"
                    :class="tabClass ('read')"
                    @click="activeTab = 'read'">
                    {{ t ("read") }}
                </button>
            </div>

            <div class="max-h-80 overflow-y-auto">
                <div
                    v-if="dropdownLoading"
                    class="px-4 py-6 text-center text-xs text-muted-foreground">
                    {{ t ("loading") }}
                </div>
                <div
                    v-else-if="items.length === 0"
                    class="px-4 py-6 text-center text-xs text-muted-foreground">
                    {{ t ("no_notifications") }}
                </div>
                <button
                    v-for="item in items"
                    :key="item.id"
                    type="button"
                    class="flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    :class="{ 'bg-muted/30': notificationIsUnread (item) }"
                    @click="handleNotificationClick (item.id)">
                    <NotificationItemPreview :item="item" />
                </button>
            </div>

            <div class="border-t px-4 py-2">
                <NuxtLink
                    to="/notifications"
                    class="block text-center text-xs text-primary hover:underline"
                    @click="open = false">
                    {{ t ("view_all_notifications") }}
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
