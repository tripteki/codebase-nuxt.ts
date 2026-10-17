<script setup lang="ts">
import { computed, } from "vue";
import { navigateTo, useAuth, useTranslation, } from "#imports";

import AdminAccountDropdown from "@/components/admin/AdminAccountDropdown.vue";
import AdminSearchBox from "@/components/admin/AdminSearchBox.vue";
import NotificationDropdown from "@/components/admin/NotificationDropdown.vue";
import AppLogo from "@/components/AppLogo.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { useAdminSidebar, } from "@/composables/useAdminSidebar";
import { useResolvedAuth, } from "@/composables/useResolvedAuth";
import { unsubscribeWebPush, } from "@/lib/webpush-session";
import { clearAuthCookies, } from "@/lib/auth-cookies";

const props = defineProps<{
    showLogout?: boolean;
}>();

const { t: tCommon, } = useTranslation ("common");
const { t: tAuth, } = useTranslation ("auth");
const { signOut, token, } = useAuth ();
const { clearToken, } = useAuthState ();
const { open, toggleOpen, } = useAdminSidebar ();
const { isAuthenticated, isLoading, } = useResolvedAuth ({
    trustAuthenticatedBeforeResolve: props.showLogout,
});

const showAccountNav = computed (
    () => props.showLogout && isAuthenticated.value
);
const homeHref = computed (() =>
    isAuthenticated.value ? "/admin/dashboard" : "/"
);

async function handleLogout (): Promise<void> {
    void unsubscribeWebPush (token.value);

    try {
        await signOut ({ redirect: false });
    } catch {
        //
    }

    clearToken ();
    clearAuthCookies ();

    if (import.meta.client) {
        window.location.assign ("/auth/login?signedOut=1");
    } else {
        await navigateTo ("/auth/login?signedOut=1", { replace: true });
    }
}
</script>

<template>
    <header :class="showLogout ? 'relative z-10 px-4 py-4 lg:px-6' : 'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'">
        <div :class="showLogout ? 'relative flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-gray-600 dark:bg-gray-700/80' : 'container mx-auto flex items-center gap-4 px-4 py-4'">
            <div :class="showLogout ? 'flex min-w-0 flex-1 items-center gap-2' : 'contents'">
                <button
                    v-if="showLogout"
                    type="button"
                    class="hidden h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:inline-flex dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
                    :aria-label="tCommon ('admin_toggle_sidebar')">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <button
                    v-if="showLogout"
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
                    :aria-expanded="open"
                    aria-controls="admin-sidebar"
                    :aria-label="tCommon ('menu')"
                    @click="toggleOpen">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>
                <NuxtLink
                    :to="homeHref"
                    :class="showLogout ? 'inline-flex h-8 shrink-0 items-center justify-center transition hover:opacity-90 lg:hidden' : 'flex shrink-0 items-center hover:opacity-80'">
                    <AppLogo />
                    <span class="sr-only">{{ tCommon ("welcome") }}</span>
                </NuxtLink>
                <AdminSearchBox v-if="isAuthenticated" variant="desktop" />
            </div>
            <div :class="showLogout ? 'flex shrink-0 items-center gap-2' : 'ml-auto flex shrink-0 items-center gap-4'">
                <ClientOnly>
                    <NotificationDropdown v-if="showAccountNav" />
                    <ThemeToggle />
                    <AdminAccountDropdown v-if="isAuthenticated" @logout="handleLogout" />
                    <FbButton
                        v-else-if="! isLoading"
                        variant="ghost"
                        size="icon"
                        to="/auth/login"
                        :aria-label="tAuth ('log_in')">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="h-5 w-5">
                            <path
                                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" x2="3" y1="12" y2="12" />
                        </svg>
                    </FbButton>
                </ClientOnly>
            </div>
        </div>
    </header>
</template>
