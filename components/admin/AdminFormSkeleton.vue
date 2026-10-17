<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbSkeleton from "@/components/flowbite/FbSkeleton.vue";
import { fbCard, } from "@/lib/flowbite-classes";

withDefaults (
    defineProps<{
        fields?: number;
        showActions?: boolean;
    }> (),
    {
        fields: 5,
        showActions: true,
    },
);

const { t, } = useTranslation ("common");
</script>

<template>
    <div :class="fbCard" role="status" aria-busy="true" aria-live="polite">
        <span class="sr-only">{{ t ("loading") }}</span>
        <div class="space-y-4">
            <div v-for="index in fields" :key="index" class="space-y-2">
                <FbSkeleton class-name="h-4 w-24" />
                <FbSkeleton class-name="h-10 w-full rounded-lg" />
            </div>
            <div v-if="showActions" class="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                <FbSkeleton class-name="h-10 w-24 rounded-lg" />
                <FbSkeleton class-name="h-10 w-24 rounded-lg" />
            </div>
        </div>
    </div>
</template>
