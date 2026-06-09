<script setup lang="ts">
import { ref, onMounted, } from "vue";
import { useI18n, } from "#imports";

import { useLocale, } from "@/composables/useLocale";

const { locale, } = useI18n ();
const { availableLocales, currentLocale, setCurrentLocale, } = useLocale ();
const mounted = ref (false);

onMounted ((): void =>
{
    mounted.value = true;
});

function handleChange (event: Event): void
{
    const target = event.target as HTMLSelectElement;

    setCurrentLocale (target.value);
}
</script>

<template>
    <select
        v-if="! mounted"
        class="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        disabled
    >
        <option :value="locale">
            {{ String(locale).toUpperCase() }}
        </option>
    </select>
    <select
        v-else
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
