<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, } from "vue";

import I18nFlag from "@/components/I18nFlag.vue";
import { useLocale, } from "@/composables/useLocale";
import { LOCALE_SWITCHER_LABELS, } from "@/lib/locale-flags";
import { cn, } from "@/lib/utils";

const props = withDefaults (
    defineProps<{
        onDark?: boolean;
        menuPosition?: "top" | "bottom";
        menuAlign?: "start" | "end" | "center";
    }> (),
    {
        onDark: false,
        menuPosition: "bottom",
        menuAlign: "end",
    }
);

const { availableLocales, currentLocale, setCurrentLocale, } = useLocale ();

const open = ref (false);
const rootRef = ref<HTMLElement | null> (null);

const triggerClass = computed (() =>
    cn (
        "i18n-trigger inline-flex items-center gap-2 rounded-full border-0 bg-transparent px-3 py-2 text-sm font-medium shadow-none transition-all focus:outline-none focus:ring-2",
        props.onDark
            ? "text-white/80 hover:bg-white/10 hover:text-white focus:ring-white/25"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-700/80 dark:hover:text-white dark:focus:ring-gray-600"
    )
);

const menuClass = computed (() =>
    cn (
        "absolute z-[60] min-w-[11rem] w-max overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800",
        props.menuAlign === "start"
            ? "start-0"
            : props.menuAlign === "center"
                ? "left-1/2 -translate-x-1/2"
                : "end-0 -translate-x-2",
        props.menuPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
    )
);

function localeLabel (locale: string): string {
    return LOCALE_SWITCHER_LABELS[locale] ?? locale.toUpperCase ();
}

function toggle (): void {
    open.value = ! open.value;
}

function close (): void {
    open.value = false;
}

function selectLocale (locale: string): void {
    setCurrentLocale (locale);
    close ();
}

function handleDocumentClick (event: MouseEvent): void {
    if (! rootRef.value?.contains (event.target as Node)) {
        close ();
    }
}

onMounted (() => {
    document.addEventListener ("click", handleDocumentClick);
});

onUnmounted (() => {
    document.removeEventListener ("click", handleDocumentClick);
});
</script>

<template>
    <div ref="rootRef" class="relative">
        <button
            type="button"
            :class="triggerClass"
            :aria-expanded="open"
            :aria-label="localeLabel (String (currentLocale))"
            @click.stop="toggle">
            <I18nFlag :locale="String (currentLocale)" />
            <span class="i18n-trigger__code uppercase">{{ String (currentLocale) }}</span>
            <svg
                class="i18n-trigger__chevron h-3 w-3 transition-transform"
                :class="open ? 'rotate-180' : ''"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <div v-if="open" :class="menuClass" role="menu" @click.stop>
            <button
                v-for="langOption in availableLocales"
                :key="`lang-${langOption}`"
                type="button"
                role="menuitem"
                :class="
                    cn (
                        'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                        langOption === currentLocale
                            ? 'bg-gray-50 text-gray-900 dark:bg-gray-700/60 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/40',
                    )
                "
                @click="selectLocale (langOption)">
                <I18nFlag :locale="langOption" />
                <span class="whitespace-nowrap text-start">{{ localeLabel (langOption) }}</span>
                <svg
                    v-if="langOption === currentLocale"
                    class="h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7" />
                </svg>
            </button>
        </div>
    </div>
</template>
