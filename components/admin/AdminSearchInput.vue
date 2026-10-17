<script setup lang="ts">
import { useTranslation, } from "#imports";

import { fbAdminSearch, fbInputIconWrap, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

defineProps<{
    id: string;
    placeholder: string;
}> ();

const model = defineModel<string> ({ required: true, });

const emit = defineEmits<{
    submit: [];
}> ();

const { t, } = useTranslation ("common");

function clear (): void {
    model.value = "";
    emit ("submit");
}

function onKeyup (event: KeyboardEvent): void {
    if (event.key === "Enter") {
        emit ("submit");
    }
}
</script>

<template>
    <div class="relative">
        <div :class="fbInputIconWrap">
            <img src="/manifest/asset/icon-search.svg" alt="" class="h-4 w-4 shrink-0 object-contain" loading="lazy" decoding="async">
        </div>
        <input
            :id="id"
            v-model="model"
            type="search"
            :class="cn (fbAdminSearch, 'search-hide-native-clear', model.length > 0 && 'pe-10')"
            :placeholder="placeholder"
            @keyup="onKeyup">
        <button
            v-if="model.length > 0"
            type="button"
            class="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            :aria-label="t ('search_clear')"
            @click="clear">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>
