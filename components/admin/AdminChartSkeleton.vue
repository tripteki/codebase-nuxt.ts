<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbSkeleton from "@/components/flowbite/FbSkeleton.vue";
import { fbCard, } from "@/lib/flowbite-classes";

withDefaults (
    defineProps<{
        height?: number;
        embedded?: boolean;
    }> (),
    {
        height: 280,
        embedded: false,
    },
);

const { t, } = useTranslation ("common");
</script>

<template>
    <div :class="embedded ? undefined : fbCard" role="status" aria-busy="true" aria-live="polite">
        <span class="sr-only">{{ t ("loading") }}</span>
        <div v-if="! embedded" class="mb-4 space-y-2">
            <FbSkeleton class-name="h-5 w-40" />
            <FbSkeleton class-name="h-4 w-56 max-w-full" />
        </div>
        <FbSkeleton class-name="w-full rounded-lg" :style="{ height: `${height}px`, }" />
    </div>
</template>
