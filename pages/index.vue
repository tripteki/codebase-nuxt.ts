<script setup lang="ts">
import { computed, } from "vue";
import {
    definePageMeta,
    useHead,
    useTranslation,
} from "#imports";

import I18nSwitcher from "@/components/I18nSwitcher.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { definePagePublic, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: "default",
});

definePagePublic ();

const { t, } = useTranslation ("common");
const { t: tAuth, } = useTranslation ("auth");

useHead ({
    title: computed (() => t ("welcome")),
});
</script>

<template>
    <div class="relative flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <div class="public-toolbar absolute top-3 left-4 z-20 flex items-center gap-2 sm:left-6">
            <ThemeToggle
                id="theme-toggle"
                class="border-0 bg-transparent text-gray-500 shadow-none hover:bg-white/10 dark:text-gray-300" />
            <I18nSwitcher on-dark class="i18n-trigger" />
        </div>
        <main class="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 sm:py-24">
            <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,color-mix(in_srgb,var(--brand-primary)_20%,transparent),transparent)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,color-mix(in_srgb,var(--brand-primary)_32%,transparent),transparent)]" />
            <div class="relative z-10 mx-auto w-full max-w-2xl text-center">
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 sm:text-sm dark:text-gray-400">
                    {{ t ("title") }}
                </p>
                <h1 class="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:mt-5 sm:text-5xl md:text-6xl">
                    <span class="bg-gradient-to-br from-[var(--brand-primary)] via-[color-mix(in_srgb,var(--brand-primary)_88%,#0f172a_12%)] to-[color-mix(in_srgb,var(--brand-primary)_55%,#334155)] bg-clip-text text-transparent dark:from-[color-mix(in_srgb,var(--brand-primary)_95%,#f8fafc)] dark:via-[var(--brand-primary)] dark:to-[color-mix(in_srgb,var(--brand-primary)_70%,#94a3b8)]">
                        {{ t ("subtitle") }}
                    </span>
                </h1>
                <div class="mx-auto mt-8 h-1 w-12 rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_65%,transparent)] sm:mt-10 sm:w-14" />
                <p class="mx-auto mt-8 max-w-lg text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300">
                    {{ t ("description") }}
                </p>
                <div class="mx-auto mt-10 flex flex-wrap justify-center gap-3 sm:mt-12">
                    <NuxtLink
                        to="/auth/login"
                        class="inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-base font-medium text-white shadow-sm transition hover:opacity-90">
                        {{ tAuth ("sign_in") }}
                    </NuxtLink>
                    <NuxtLink
                        to="/auth/register"
                        class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-900 shadow-sm transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                        {{ tAuth ("sign_up") }}
                    </NuxtLink>
                </div>
            </div>
        </main>
    </div>
</template>
