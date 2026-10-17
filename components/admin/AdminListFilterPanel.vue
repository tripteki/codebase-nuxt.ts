<script setup lang="ts">
import { useTranslation, } from "#imports";

import AdminFilterFunnelIcon from "@/components/admin/AdminFilterFunnelIcon.vue";
import FbButton from "@/components/flowbite/FbButton.vue";

defineProps<{
    open: boolean;
    activeCount: number;
}> ();

const emit = defineEmits<{
    toggle: [];
    clear: [];
}> ();

const { t, } = useTranslation ("common");
</script>

<template>
    <div id="page-table-filter" class="contents">
        <FbButton
            variant="tertiary"
            size="xs"
            type="button"
            class="inline-flex items-center gap-2 self-start sm:ms-auto"
            :aria-expanded="open"
            @click="emit ('toggle')">
            {{ t ("table_filter") }}
            <span
                v-if="activeCount > 0"
                class="badge-brand-primary inline-flex min-w-5 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium">
                {{ activeCount }}
            </span>
            <AdminFilterFunnelIcon />
        </FbButton>
        <div
            v-show="open"
            class="w-72 max-w-full self-start rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:ms-auto sm:basis-full dark:border-gray-700 dark:bg-gray-800">
            <slot />
            <div class="mt-4 flex justify-end">
                <FbButton variant="secondary" size="xs" type="button" :disabled="activeCount === 0" @click="emit ('clear')">
                    {{ t ("table_filter_clear") }}
                </FbButton>
            </div>
        </div>
    </div>
</template>
