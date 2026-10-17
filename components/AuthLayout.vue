<script setup lang="ts">
import { computed, } from "vue";
import { useRuntimeConfig, useTranslation, } from "#imports";

import I18nSwitcher from "@/components/I18nSwitcher.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { formatAppName, } from "@/lib/app-name";
import { cn, } from "@/lib/utils";

const props = withDefaults (defineProps<{
    title?: string;
    description?: string;
    variant?: "hero" | "split";
}> (), {
    title: "",
    description: "",
    variant: "split",
});

const { t, } = useTranslation ("common");
const year = new Date ().getFullYear ();
const isHero = computed (() => props.variant === "hero");
const appName = computed (() => formatAppName (String (useRuntimeConfig ().public.appName ?? "codebase")));
</script>

<template>
    <div
        :class="cn (
            'auth-login-page relative flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950',
            isHero ? 'auth-login-page--hero' : 'lg:flex-row',
        )">
        <div class="auth-toolbar absolute top-3 left-4 z-20 flex items-center gap-2 sm:left-6">
            <ThemeToggle
                id="theme-toggle"
                :class="
                    isHero
                        ? 'border-0 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white focus:ring-white/25'
                        : 'border-0 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white focus:ring-white/25 lg:text-gray-500 lg:hover:bg-gray-100 lg:hover:text-gray-900 lg:focus:ring-gray-100 dark:lg:text-gray-400 dark:lg:hover:bg-gray-700 dark:lg:hover:text-white dark:lg:focus:ring-gray-700'
                " />
            <I18nSwitcher
                on-dark
                menu-position="bottom"
                menu-align="start" />
        </div>
        <aside
            v-if="! isHero"
            class="auth-login-marketing-pane relative hidden min-h-screen items-center justify-center px-6 lg:flex lg:w-1/2 xl:px-12">
            <div class="auth-login-potential-bg absolute inset-0" aria-hidden="true" />
            <div class="relative z-10 w-full max-w-xl">
                <h2 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 xl:text-5xl dark:text-white">
                    <span class="auth-text-animate-1 inline-block">{{ t ("title") }}</span>
                    <br>
                    <span class="auth-text-animate-2 inline-block">{{ t ("subtitle") }}</span>
                </h2>
                <p class="max-w-xl text-base leading-relaxed text-gray-600 xl:text-lg dark:text-gray-300">
                    {{ t ("description") }}
                </p>
            </div>
        </aside>
        <div :class="cn ('auth-hero-panel relative flex min-h-screen w-full flex-col items-center overflow-hidden px-4 text-white sm:px-6 lg:px-8', isHero ? '' : 'lg:w-1/2')">
            <div class="auth-hero-bg pointer-events-none absolute inset-0" aria-hidden="true" />
            <div class="pointer-events-none absolute inset-0 bg-[length:22px_22px] bg-[radial-gradient(rgba(255,255,255,0.26)_1px,transparent_1px)] opacity-30" aria-hidden="true" />
            <main class="auth-panel relative z-10 flex min-h-screen w-full max-w-md flex-col py-8 lg:max-w-[560px] lg:py-0">
                <div class="flex flex-1 flex-col justify-center">
                    <NuxtLink to="/" :class="isHero ? 'auth-brand-lockup mb-10 flex items-center justify-center gap-4 lg:mb-14' : 'mb-8 flex items-center justify-center gap-3'" :aria-label="appName">
                        <img src="/manifest/asset/logo.png" alt="" width="96" height="96" :class="isHero ? 'h-16 w-16 object-contain lg:h-20 lg:w-20 xl:h-24 xl:w-24' : 'h-12 w-12 object-contain'">
                        <span :class="isHero ? 'text-4xl font-bold uppercase tracking-tight sm:text-5xl' : 'text-3xl font-bold uppercase tracking-tight'">{{ appName }}</span>
                    </NuxtLink>
                    <div v-if="title || description" class="mb-6 space-y-2 text-center">
                        <h1 v-if="title" class="text-xl font-semibold sm:text-2xl">{{ title }}</h1>
                        <p v-if="description" class="text-sm text-white/80">{{ description }}</p>
                    </div>
                    <div class="auth-form">
                        <slot />
                    </div>
                </div>
                <p class="mt-8 text-center text-[0.6875rem] leading-relaxed text-white/72 sm:mt-10 sm:text-xs">© {{ year }}</p>
            </main>
        </div>
    </div>
</template>
