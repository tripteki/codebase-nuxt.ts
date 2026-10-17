<script setup lang="ts">
import { onUnmounted, watch, } from "vue";

import { useAdminSidebar, } from "@/composables/useAdminSidebar";
import { usePwaInstall, } from "@/composables/usePwaInstall";
import { formatAppName, } from "@/lib/app-name";

const config = useRuntimeConfig ();
const { t, } = useTranslation ("common");
const { open, } = useAdminSidebar ();
const { visible, isInstalling, dismiss, install, } = usePwaInstall ();

watch ([visible, open], ([isVisible, isSidebarOpen]) => {
    document.documentElement.classList.toggle ("pwa-install-open", isVisible && ! isSidebarOpen);
}, { immediate: true, });

onUnmounted (() => {
    document.documentElement.classList.remove ("pwa-install-open");
});

const appLabel = computed (() => formatAppName (String (config.public.appName ?? "App")));
</script>

<template>
    <div
        v-if="visible && ! open"
        class="pwa-install pointer-events-auto absolute bottom-4 end-4 w-56 rounded-2xl border border-gray-200/90 bg-white/95 p-2 shadow-lg backdrop-blur-md dark:border-gray-600/90 dark:bg-gray-900/95"
        role="region"
        :aria-label="t ('pwa_install')">
        <div class="flex items-center gap-2">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                <img
                    src="/manifest/asset/logo.png"
                    :alt="appLabel"
                    class="block h-10 w-10 object-contain"
                    width="40"
                    height="40"
                    loading="lazy"
                    decoding="async">
            </div>

            <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-semibold leading-tight">
                    {{ appLabel }}
                </p>
                <p class="mt-0.5 text-[10px] leading-snug text-gray-500 dark:text-gray-400">
                    {{ t ("pwa_install_hint") }}
                </p>
            </div>

            <button
                type="button"
                class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                :aria-label="t ('close')"
                @click="dismiss">
                <svg
                    class="h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <button
            type="button"
            class="btn-brand-primary mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-0 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isInstalling"
            @click="install">
            <svg
                class="h-4 w-4 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            <span>{{
                isInstalling ? t ("pwa_installing") : t ("pwa_install")
            }}</span>
        </button>
    </div>
</template>
