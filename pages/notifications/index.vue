<script setup lang="ts">
import { computed, onMounted, ref, watch, } from "vue";
import { useHead, useTranslation, } from "#imports";

import FooterLayout from "@/components/FooterLayout.vue";
import HeaderLayout from "@/components/HeaderLayout.vue";
import NotificationItemPreview from "@/components/admin/NotificationItemPreview.vue";
import { Button, } from "@/components/ui/button";
import {
    type NotificationStatusFilter,
    useNotifications,
} from "@/composables/useNotifications";
import {
    notificationIsUnread,
    notificationTargetUrl,
} from "@/lib/notification-presenter";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { definePageAuthed, } from "@/lib/define-page-auth";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const {
    items,
    meta,
    isLoading,
    fetchList,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    actionId,
} = useNotifications ();

const activeTab = ref<"all" | "unread" | "read">("all");
const currentPage = ref (1);

const statusFilter = computed<NotificationStatusFilter>(() => {
    if (activeTab.value === "unread") {
        return "unread";
    }

    if (activeTab.value === "read") {
        return "read";
    }

    return "";
});

async function load (): Promise<void> {
    await fetchList ({
        current_page: currentPage.value,
        limit: 15,
        status: statusFilter.value,
    });
}

watch ([activeTab, currentPage], () => {
    load ();
});

onMounted (() => {
    load ();
});

async function handleClick (id: string): Promise<void> {
    const item = items.value.find ((entry) => entry.id === id);
    const targetUrl = item ? notificationTargetUrl (item) : null;

    await markAsRead (id);

    if (targetUrl) {
        await navigateTo (targetUrl, {
            external: targetUrl.startsWith ("http"),
            open: { target: "_blank" },
        });
    }
}

useHead ({
    title: computed (() => t ("notifications")),
});
</script>

<template>
    <div v-if="canRender" class="min-h-screen flex flex-col bg-background">
        <HeaderLayout show-logout />

        <main class="flex-1 container mx-auto px-4 py-8">
            <div class="mx-auto max-w-3xl space-y-6">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold tracking-tight">
                            {{ t ("notifications") }}
                        </h1>
                        <p class="text-muted-foreground">
                            {{ t ("notifications_description") }}
                        </p>
                    </div>
                    <Button variant="outline" @click="markAllAsRead">
                        {{ t ("mark_all_read") }}
                    </Button>
                </div>

                <div class="flex gap-2">
                    <Button
                        :variant="activeTab === 'all' ? 'default' : 'outline'"
                        size="sm"
                        @click="
                            activeTab = 'all';
                            currentPage = 1;
                        ">
                        {{ t ("all") }}
                    </Button>
                    <Button
                        :variant="
                            activeTab === 'unread' ? 'default' : 'outline'
                        "
                        size="sm"
                        @click="
                            activeTab = 'unread';
                            currentPage = 1;
                        ">
                        {{ t ("unread") }}
                    </Button>
                    <Button
                        :variant="activeTab === 'read' ? 'default' : 'outline'"
                        size="sm"
                        @click="
                            activeTab = 'read';
                            currentPage = 1;
                        ">
                        {{ t ("read") }}
                    </Button>
                </div>

                <div
                    v-if="isLoading"
                    class="py-8 text-center text-sm text-muted-foreground">
                    {{ t ("loading") }}
                </div>

                <div
                    v-else-if="items.length === 0"
                    class="rounded-lg border py-12 text-center text-sm text-muted-foreground">
                    {{ t ("no_notifications") }}
                </div>

                <div v-else class="divide-y rounded-lg border">
                    <div
                        v-for="item in items"
                        :key="item.id"
                        class="flex items-start gap-3 px-4 py-4"
                        :class="{ 'bg-muted/30': notificationIsUnread (item) }">
                        <button
                            type="button"
                            class="min-w-0 flex-1 text-left"
                            @click="handleClick (item.id)">
                            <NotificationItemPreview :item="item" />
                        </button>
                        <Button
                            variant="ghost"
                            size="sm"
                            class="shrink-0 text-destructive"
                            :disabled="actionId === item.id"
                            @click="deleteNotification (item.id)">
                            {{ t ("delete") }}
                        </Button>
                    </div>
                </div>

                <div
                    v-if="meta && (meta.last_page ?? 1) > 1"
                    class="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        :disabled="currentPage <= 1"
                        @click="currentPage -= 1">
                        {{ t ("previous") }}
                    </Button>
                    <span class="text-sm text-muted-foreground">
                        {{ currentPage }} / {{ meta.last_page }}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        :disabled="currentPage >= (meta.last_page ?? 1)"
                        @click="currentPage += 1">
                        {{ t ("next") }}
                    </Button>
                </div>
            </div>
        </main>

        <FooterLayout />
    </div>
</template>
