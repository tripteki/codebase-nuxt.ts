<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, } from "vue";
import { useAuth, useTranslation, } from "#imports";

import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import {
    resolveAccountAvatarUrl,
    resolveAccountDisplayName,
    resolveAccountInitials,
    resolveEmailPrefix,
    resolveSessionUser,
} from "@/lib/account-display";

const emit = defineEmits<{
    logout: [];
}> ();

const { t: tCommon, } = useTranslation ("common");
const { t: tAuth, } = useTranslation ("auth");
const { data, } = useAuth ();
const { roles, } = useAdminAccesses ();
const open = ref (false);
const mounted = ref (false);
const root = ref<HTMLElement | null> (null);

const user = computed (() => resolveSessionUser (data.value));
const userLabel = computed (() => resolveAccountDisplayName (user.value, tCommon ("profile")));
const avatarUrl = computed (() => resolveAccountAvatarUrl (user.value));
const emailPrefix = computed (() => resolveEmailPrefix (user.value?.email));
const roleLabel = computed (() => {
    const primaryRole = roles.value[0]?.trim () ?? "";

    if (! primaryRole) {
        return "";
    }

    const translated = tCommon (`role_${primaryRole}`);

    if (translated === `role_${primaryRole}` || translated.endsWith (`.role_${primaryRole}`)) {
        return primaryRole;
    }

    return translated;
});
const displayInitials = computed (() => mounted.value ? resolveAccountInitials (userLabel.value) : "·");

const menuItemClass = "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/70";

function close (): void {
    open.value = false;
}

function toggle (): void {
    open.value = ! open.value;
}

function handleLogout (): void {
    close ();
    emit ("logout");
}

function onPointerDown (event: Event): void {
    const target = event.target;

    if (! (target instanceof Node) || ! root.value?.contains (target)) {
        close ();
    }
}

onMounted (() => {
    mounted.value = true;
    document.addEventListener ("pointerdown", onPointerDown);
});

onBeforeUnmount (() => {
    document.removeEventListener ("pointerdown", onPointerDown);
});
</script>

<template>
    <div ref="root" class="relative">
        <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-transparent bg-slate-100/90 px-1.5 py-1 transition-colors hover:border-slate-200 hover:bg-white dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
            :aria-expanded="open"
            :aria-label="userLabel"
            data-test="account-dropdown-toggle"
            @click.stop="toggle">
            <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                <img v-if="avatarUrl" :src="avatarUrl" :alt="userLabel" class="h-full w-full object-cover">
                <span v-else>{{ displayInitials }}</span>
            </span>
            <span class="hidden min-w-0 max-w-[10.5rem] flex-col items-start text-left leading-tight xl:flex">
                <span class="w-full truncate text-xs font-semibold text-slate-900 dark:text-white">{{ userLabel }}</span>
                <span v-if="emailPrefix" class="w-full truncate text-[0.7rem] text-slate-500 dark:text-slate-400">{{ emailPrefix }}</span>
                <span v-if="roleLabel" class="w-full truncate text-[0.7rem] capitalize text-slate-500 dark:text-slate-400">{{ roleLabel }}</span>
            </span>
            <svg class="mr-1 hidden h-3 w-3 shrink-0 text-slate-500 dark:text-slate-400 xl:inline" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
            </svg>
        </button>
        <div
            v-show="open"
            class="absolute end-0 top-12 z-50 w-[15.5rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800"
            @click.stop>
            <div class="border-b border-slate-100 px-3.5 py-3.5 text-center dark:border-slate-700">
                <span class="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-base font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    <img v-if="avatarUrl" :src="avatarUrl" :alt="userLabel" class="h-full w-full object-cover">
                    <span v-else>{{ displayInitials }}</span>
                </span>
                <div class="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-white">{{ userLabel }}</div>
                <div v-if="emailPrefix" class="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{{ emailPrefix }}</div>
                <div v-if="roleLabel" class="mt-1.5">
                    <span class="inline-flex max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">{{ roleLabel }}</span>
                </div>
                <NuxtLink
                    to="/admin/settings/personal"
                    class="mt-3 inline-flex text-sm font-medium underline"
                    data-test="account-menu-settings"
                    @click="close">
                    {{ tCommon ("profile_settings") }}
                </NuxtLink>
            </div>
            <div class="p-2">
                <NuxtLink to="/admin/dashboard" :class="menuItemClass" @click="close">{{ tCommon ("dashboard") }}</NuxtLink>
            </div>
            <div class="border-t border-slate-100 p-2 dark:border-slate-700">
                <button
                    type="button"
                    class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    data-test="logout-button"
                    @click="handleLogout">
                    {{ tAuth ("logout") }}
                </button>
            </div>
        </div>
    </div>
</template>
