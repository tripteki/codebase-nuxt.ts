<script setup lang="ts">
import { computed, ref, watch, } from "vue";
import { useRoute, useRuntimeConfig, useTranslation, } from "#imports";

import AdminSearchBox from "@/components/admin/AdminSearchBox.vue";
import AdminSidebarIcon from "@/components/admin/AdminSidebarIcon.vue";
import AppLogo from "@/components/AppLogo.vue";
import I18nSwitcher from "@/components/I18nSwitcher.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminSidebar, } from "@/composables/useAdminSidebar";
import {
    ADMIN_NAVIGATION_GROUPS,
    ADMIN_TOP_NAVIGATION,
} from "@/lib/admin-navigation";
import { formatAppName, } from "@/lib/app-name";
import { cn, } from "@/lib/utils";

const route = useRoute ();
const { t, } = useTranslation ("common");
const { can, } = useAdminAccesses ();
const { open, close, } = useAdminSidebar ();
const openSection = ref<string | null> (null);
const year = new Date ().getFullYear ();
const appName = computed (() => formatAppName (String (useRuntimeConfig ().public.appName ?? "codebase")));
const linkClass = "flex items-center rounded-full px-3 py-2 text-sm font-medium text-[#e9f0ff] transition-all hover:bg-white/10 hover:text-white";
const subLinkClass = "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white";
const footerActionClass = "rounded-lg p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white";

function scrollToTop (): void {
    document.getElementById ("admin-main-content")?.scrollIntoView ({
        behavior: "smooth",
        block: "start",
    });
}

const topItems = computed (() => ADMIN_TOP_NAVIGATION);
const groups = computed (() =>
    ADMIN_NAVIGATION_GROUPS
        .map ((group) => ({
            ...group,
            items: group.items.filter ((item) => can (item.permission)),
        }))
        .filter ((group) => group.items.length > 0)
);

function active (path: string): boolean {
    if (path === "/admin/dashboard") {
        return route.path === path;
    }

    return route.path === path || route.path.startsWith (`${path}/`);
}

function toggleSection (key: string): void {
    openSection.value = openSection.value === key ? null : key;
}

watch ([() => route.path, groups], () => {
    const match = groups.value.find ((group) => group.items.some ((item) => active (item.to)));

    if (match) {
        openSection.value = match.key;
    }
}, { immediate: true, });
</script>

<template>
    <div v-if="open" class="fixed inset-0 z-30 bg-gray-900/50 lg:hidden" @click="close" />
    <aside
        id="admin-sidebar"
        class="admin-sidebar-gradient fixed inset-y-0 left-0 z-40 flex h-svh w-64 flex-col rounded-r-[20px] text-white transition-transform"
        :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
        <div class="relative flex h-16 shrink-0 flex-col items-center justify-center px-4 py-3">
            <button
                type="button"
                class="absolute end-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
                :aria-label="t ('close')"
                @click="close ()">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
            </button>
            <NuxtLink to="/admin/dashboard" class="inline-flex h-8 max-w-[10rem] items-center justify-center transition hover:opacity-90" :aria-label="appName" @click="close ()">
                <AppLogo class="h-8 brightness-0 invert" />
            </NuxtLink>
        </div>
        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <div class="mb-4 lg:hidden">
                <AdminSearchBox variant="sidebar" />
            </div>
            <NuxtLink
                v-for="item in topItems"
                :key="item.to"
                :to="item.to"
                :class="cn (linkClass, active (item.to) && 'admin-sidebar-link-active text-white')"
                @click="close ()">
                <AdminSidebarIcon :name="item.key" class="me-3" />
                <span class="truncate">{{ t (item.key) }}</span>
            </NuxtLink>
            <section v-for="group in groups" :key="group.key">
                <button
                    type="button"
                    data-test="sidebar-group-toggle"
                    class="flex w-full items-center justify-between rounded-full px-3 py-2 text-left text-sm font-medium text-[#e9f0ff] hover:bg-white/10 hover:text-white"
                    :class="openSection === group.key && 'bg-white/10 text-white'"
                    :aria-expanded="openSection === group.key"
                    @click="toggleSection (group.key)">
                    <span class="inline-flex items-center">
                        <AdminSidebarIcon :name="group.key" />
                        <span class="truncate">{{ t (group.key) }}</span>
                    </span>
                    <svg class="h-4 w-4 shrink-0 transition-transform" :class="openSection === group.key ? '' : 'rotate-90'" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                    </svg>
                </button>
                <div v-show="openSection === group.key" class="mt-1 space-y-1 pl-10">
                    <NuxtLink
                        v-for="item in group.items"
                        :key="item.to"
                        :to="item.to"
                        :class="cn (subLinkClass, active (item.to) && 'admin-sidebar-link-active text-white')"
                        @click="close ()">
                        <AdminSidebarIcon :name="item.key" size="sm" />
                        <span class="truncate">{{ t (item.key) }}</span>
                    </NuxtLink>
                </div>
            </section>
        </nav>
        <div class="shrink-0 border-t border-white/10 px-4 py-4">
            <div class="mb-3 flex items-center justify-center gap-1">
                <NuxtLink
                    to="/admin/settings/personal"
                    :class="footerActionClass"
                    :title="t ('settings')"
                    :aria-label="t ('settings')"
                    @click="close ()">
                    <AdminSidebarIcon name="settings" />
                </NuxtLink>
                <button
                    type="button"
                    :class="footerActionClass"
                    :title="t ('admin_sidebar_scroll_to_top')"
                    :aria-label="t ('admin_sidebar_scroll_to_top')"
                    @click="scrollToTop">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                </button>
                <I18nSwitcher on-dark menu-position="top" />
            </div>
            <p class="text-center text-xs text-white/80">© {{ year }} {{ appName }}</p>
        </div>
    </aside>
</template>
