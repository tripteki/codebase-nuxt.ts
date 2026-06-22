<script setup lang="ts">
import AppLogoIcon from "@/components/AppLogoIcon.vue";
import { usePwaInstall, } from "@/composables/usePwaInstall";

const config = useRuntimeConfig ();
const { t, } = useTranslation ("common");
const { visible, isInstalling, dismiss, install, } = usePwaInstall ();

const appLabel = computed (() => {
    const name = String (config.public.appName ?? "App");

    return name.charAt (0).toUpperCase () + name.slice (1);
});
</script>

<template>
    <div
        v-if="visible"
        class="pwa-install fixed bottom-4 right-4 z-[100] max-w-[min(100vw-1.5rem,18rem)] rounded-2xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur-md max-sm:bottom-3 max-sm:right-3"
        role="region"
        :aria-label="t ('pwa_install')">
        <div class="flex items-start gap-2">
            <div
                class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
                <AppLogoIcon
                    class="size-9 fill-current text-foreground"
                    aria-hidden="true" />
            </div>

            <div class="min-w-0 flex-1 pt-0.5">
                <p class="truncate text-xs font-semibold leading-tight">
                    {{ appLabel }}
                </p>
                <p
                    class="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                    {{ t ("pwa_install_hint") }}
                </p>
            </div>

            <button
                type="button"
                class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
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
            class="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
