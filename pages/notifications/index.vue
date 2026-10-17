<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, } from "vue";
import { useHead, useTranslation, } from "#imports";

import AdminConfirmModal from "@/components/admin/AdminConfirmModal.vue";
import AdminPagination from "@/components/admin/AdminPagination.vue";
import AdminDetailSkeleton from "@/components/admin/AdminDetailSkeleton.vue";
import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";
import FooterLayout from "@/components/FooterLayout.vue";
import HeaderLayout from "@/components/HeaderLayout.vue";
import NotificationItemPreview from "@/components/admin/NotificationItemPreview.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { adminSegmentTabClass, } from "@/lib/admin-tabs";
import { fbCard, fbInput, fbMuted, fbPage, fbSurfacePanel, } from "@/lib/flowbite-classes";
import {
    type NotificationStatusFilter,
    useNotifications,
} from "@/composables/useNotifications";
import {
    notificationIsUnread,
    notificationTargetUrl,
} from "@/lib/notification-presenter";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { definePageAuthed, } from "@/lib/define-page-auth";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const {
    items,
    meta,
    unread,
    isLoading,
    fetchList,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    actionId,
} = useNotifications ();
const { can, ensureLoaded, } = useAdminAccesses ();

const activeTab = ref<"all" | "unread" | "read">("all");
const confirmOpen = ref (false);
const confirmMessage = ref ("");
const confirmKind = ref<"" | "one" | "all" | "read"> ("");
const confirmId = ref ("");
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
    await Promise.all ([
        fetchList ({
            current_page: currentPage.value,
            limit: 15,
            status: statusFilter.value,
        }),
        refresh (),
    ]);
}

watch ([activeTab, currentPage], () => {
    load ();
});

function onRealtime (): void {
    void load ();
}

onMounted (() => {
    void ensureLoaded ();
    load ();
    window.addEventListener ("admin:notifications-refresh", onRealtime);
});

onBeforeUnmount (() => {
    window.removeEventListener ("admin:notifications-refresh", onRealtime);
});

function removeOne (id: string): void {
    confirmKind.value = "one";
    confirmId.value = id;
    confirmMessage.value = t ("confirm_delete");
    confirmOpen.value = true;
}

function askMarkAll (): void {
    confirmKind.value = "read";
    confirmMessage.value = t ("confirm_mark_all_read");
    confirmOpen.value = true;
}

function removeAll (): void {
    confirmKind.value = "all";
    confirmMessage.value = t ("confirm_delete_all");
    confirmOpen.value = true;
}

async function runConfirm (): Promise<void> {
    confirmOpen.value = false;
    const ok = confirmKind.value === "read"
        ? await markAllAsRead ()
        : confirmKind.value === "all"
            ? await deleteAll ()
            : await deleteNotification (confirmId.value);

    if (ok) {
        await load ();
    }
}

function applyTab (tab: "all" | "unread" | "read"): void {
    activeTab.value = tab;
    currentPage.value = 1;
}

function onTabSelect (event: Event): void {
    const target = event.target;

    if (! (target instanceof HTMLSelectElement)) {
        return;
    }

    if (target.value === "all" || target.value === "unread" || target.value === "read") {
        applyTab (target.value);
    }
}

async function markOne (id: string): Promise<void> {
    const ok = await markAsRead (id);

    if (ok) {
        await load ();
    }
}

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
    <div v-if="canRender" :class="[fbPage, 'lg:pl-64',]">
        <AdminSidebar />
        <HeaderLayout show-logout />

        <main id="admin-main-content" class="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 lg:px-6">
            <div class="space-y-6">
                <AdminPageHeader :title="t ('notifications')" :description="t ('notifications_description')">
                    <template #actions>
                        <FbButton v-if="unread > 0" size="sm" :disabled="isLoading" @click="askMarkAll">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {{ t ("mark_all_read") }}
                        </FbButton>
                        <FbButton v-if="can ('notification.delete') && items.length" variant="tertiary" size="sm" :disabled="isLoading" @click="removeAll">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {{ t ("delete_all") }}
                        </FbButton>
                    </template>
                </AdminPageHeader>

                <div :class="[fbSurfacePanel, 'shadow']">
                    <div class="border-b border-gray-200 p-4 sm:p-5 dark:border-gray-700">
                        <div class="sm:hidden">
                            <label class="sr-only" for="notification-tabs">{{ t ("notifications") }}</label>
                            <select
                                id="notification-tabs"
                                :class="fbInput"
                                :value="activeTab"
                                @change="onTabSelect">
                                <option value="all">{{ t ("all") }}</option>
                                <option value="unread">{{ t ("notifications_tab_new") }}</option>
                                <option value="read">{{ t ("read") }}</option>
                            </select>
                        </div>
                        <ul
                            class="hidden text-center text-sm font-medium text-gray-500 sm:flex sm:-space-x-px dark:text-gray-400"
                            role="tablist"
                            :aria-label="t ('notifications')">
                            <li class="w-full" role="presentation">
                                <button
                                    type="button"
                                    role="tab"
                                    :aria-selected="activeTab === 'all'"
                                    :class="[adminSegmentTabClass (activeTab === 'all'), 'rounded-l-lg']"
                                    @click="applyTab ('all')">
                                    <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    {{ t ("all") }}
                                </button>
                            </li>
                            <li class="w-full" role="presentation">
                                <button
                                    type="button"
                                    role="tab"
                                    :aria-selected="activeTab === 'unread'"
                                    :class="adminSegmentTabClass (activeTab === 'unread')"
                                    @click="applyTab ('unread')">
                                    <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                                    </svg>
                                    {{ t ("notifications_tab_new") }}
                                </button>
                            </li>
                            <li class="w-full" role="presentation">
                                <button
                                    type="button"
                                    role="tab"
                                    :aria-selected="activeTab === 'read'"
                                    :class="[adminSegmentTabClass (activeTab === 'read'), 'rounded-r-lg']"
                                    @click="applyTab ('read')">
                                    <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {{ t ("read") }}
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div class="p-3 sm:p-4" role="tabpanel">
                        <AdminDetailSkeleton v-if="isLoading" :fields="4" />
                        <div v-else-if="items.length === 0" :class="[fbCard, 'p-12 text-center']">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A1.932 1.932 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p class="mt-4 text-sm" :class="fbMuted">{{ t ("no_notifications") }}</p>
                        </div>
                        <div v-else class="space-y-4">
                            <div
                                v-for="item in items"
                                :key="item.id"
                                class="relative rounded-lg border p-3 shadow-sm sm:p-4"
                                :class="notificationIsUnread (item)
                                    ? 'surface-brand-soft'
                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'">
                                <span
                                    v-if="notificationIsUnread (item)"
                                    class="notification-dot pointer-events-none absolute end-3 top-3 h-2 w-2 rounded-full sm:end-4 sm:top-4"
                                    aria-hidden="true" />
                                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" :class="notificationIsUnread (item) && 'pe-4'">
                                    <div
                                        role="button"
                                        tabindex="0"
                                        class="min-w-0 flex-1 cursor-pointer text-left"
                                        @click="handleClick (item.id)"
                                        @keydown.enter="handleClick (item.id)">
                                        <NotificationItemPreview :item="item" :compact="false" />
                                    </div>
                                    <div class="flex shrink-0 items-center gap-3">
                                        <button
                                            v-if="notificationIsUnread (item)"
                                            type="button"
                                            class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                                            :disabled="actionId === item.id"
                                            @click="markOne (item.id)">
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {{ t ("mark_as_read") }}
                                        </button>
                                        <button
                                            v-if="can ('notification.delete')"
                                            type="button"
                                            class="inline-flex items-center gap-1 text-sm text-red-600 hover:underline dark:text-red-400"
                                            :disabled="actionId === item.id"
                                            @click="removeOne (item.id)">
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            {{ t ("delete") }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="! isLoading && items.length" :class="fbSurfacePanel">
                    <AdminPagination :meta="meta" :page="currentPage" @change="currentPage = $event" />
                </div>
            </div>
        </main>

        <AdminConfirmModal
            :open="confirmOpen"
            title-id="notifications-confirm-title"
            :title="t ('confirm')"
            :message="confirmMessage"
            :confirm-label="confirmKind === 'read' ? t ('mark_all_read') : t ('delete')"
            :danger="confirmKind !== 'read'"
            @update:open="confirmOpen = $event"
            @confirm="runConfirm" />
        <FooterLayout />
    </div>
</template>
