<script setup lang="ts">
import { computed, } from "vue";
import { useTranslation, } from "#imports";

import { useTheme, } from "@/composables/useTheme";
import { cn, } from "@/lib/utils";

const props = withDefaults (
    defineProps<{
        id?: string;
        class?: string;
        onDark?: boolean;
    }> (),
    {
        onDark: false,
    }
);

const { t, } = useTranslation ("common");
const { theme, toggleTheme, } = useTheme ();

const buttonClass = computed (() =>
    cn (
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2",
        props.onDark
            ? "text-white/88 hover:bg-white/10 hover:text-white focus:ring-white/25"
            : "p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700",
        props.class
    )
);
</script>

<template>
    <button
        :id="id"
        type="button"
        :class="buttonClass"
        :aria-label="t ('toggle_theme')"
        @click="toggleTheme">
        <svg
            v-if="theme === 'dark'"
            class="h-5 w-5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        <svg
            v-else
            class="h-5 w-5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">
            <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
        </svg>
    </button>
</template>
