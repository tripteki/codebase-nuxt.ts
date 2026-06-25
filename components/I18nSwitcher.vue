<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbButton from "@/components/flowbite/FbButton.vue";
import { useLocale, } from "@/composables/useLocale";
import { LOCALE_FLAGS, LOCALE_LABELS, } from "@/lib/locale-flags";
import { cn, } from "@/lib/utils";

const { availableLocales, currentLocale, setCurrentLocale, } = useLocale ();
</script>

<template>
    <div
        class="flex items-center gap-0.5 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800"
        role="group">
        <FbButton
            v-for="langOption in availableLocales"
            :key="`lang-${langOption}`"
            type="button"
            :variant="currentLocale === langOption ? 'secondary' : 'ghost'"
            size="icon"
            :class="
                cn (
                    'h-8 w-8 border-0 text-base leading-none',
                    currentLocale !== langOption &&
                        'opacity-70 hover:opacity-100'
                )
            "
            :aria-label="LOCALE_LABELS[langOption] || langOption"
            :aria-pressed="currentLocale === langOption"
            @click="setCurrentLocale (langOption)">
            <span aria-hidden="true">{{
                LOCALE_FLAGS[langOption] || langOption
            }}</span>
        </FbButton>
    </div>
</template>
