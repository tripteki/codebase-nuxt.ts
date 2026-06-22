<script setup lang="ts">
import { computed, } from "vue";
import { navigateTo, useAuth, useTranslation, } from "#imports";

import NotificationDropdown from "@/components/admin/NotificationDropdown.vue";
import AppLogo from "@/components/AppLogo.vue";
import HeaderProfileLink from "@/components/HeaderProfileLink.vue";
import I18nSwitcher from "@/components/I18nSwitcher.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { Button, } from "@/components/ui/button";
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
        window.location.assign ("/admin/auth/login?signedOut=1");
    } else {
        await navigateTo ("/admin/auth/login?signedOut=1", { replace: true });
    }
}
</script>

<template>
    <header class="border-b">
        <div
            class="container mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
                <NuxtLink
                    :to="homeHref"
                    class="flex items-center hover:opacity-80">
                    <AppLogo />
                    <span class="sr-only">{{ tCommon ("welcome") }}</span>
                </NuxtLink>
            </div>

            <div class="flex items-center gap-4">
                <I18nSwitcher />
                <ThemeToggle />
                <ClientOnly>
                    <NotificationDropdown v-if="showAccountNav" />
                    <HeaderProfileLink v-if="showAccountNav" />
                    <Button
                        v-if="isAuthenticated"
                        variant="ghost"
                        size="icon"
                        type="button"
                        data-test="logout-button"
                        :aria-label="tAuth ('logout')"
                        @click="handleLogout">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="h-5 w-5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                    </Button>
                    <Button
                        v-else-if="! isLoading"
                        variant="ghost"
                        size="icon"
                        as-child>
                        <NuxtLink
                            to="/admin/auth/login"
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
                        </NuxtLink>
                    </Button>
                </ClientOnly>
            </div>
        </div>
    </header>
</template>
