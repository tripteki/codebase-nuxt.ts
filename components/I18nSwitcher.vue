<script setup lang="ts">
import { useI18n, } from "#imports";

import { useLocale, } from "@/composables/useLocale";

const { availableLocales, currentLocale, setCurrentLocale, } = useLocale ();

function handleChange (event: Event): void
{
    const target = event.target as HTMLSelectElement;

    setCurrentLocale (target.value);
}
</script>

<template>
    <select
        :value="currentLocale"
        class="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        @change="handleChange"
    >
        <option
            v-for="langOption in availableLocales"
            :key="`lang-${langOption}`"
            :value="langOption"
        >
            {{ String(langOption).toUpperCase() }}
        </option>
    </select>
</template>
