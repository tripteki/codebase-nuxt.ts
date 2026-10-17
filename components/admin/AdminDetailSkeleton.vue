<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbSkeleton from "@/components/flowbite/FbSkeleton.vue";
import { fbCard, } from "@/lib/flowbite-classes";

withDefaults (
    defineProps<{
        fields?: number;
    }> (),
    {
        fields: 6,
    },
);

const { t, } = useTranslation ("common");
</script>

<template>
    <div :class="fbCard" role="status" aria-busy="true" aria-live="polite">
        <span class="sr-only">{{ t ("loading") }}</span>
        <dl class="grid gap-4 sm:grid-cols-2">
            <div v-for="index in fields" :key="index" class="space-y-2">
                <FbSkeleton class-name="h-3 w-20" />
                <FbSkeleton class-name="h-5 w-32 max-w-full" />
            </div>
        </dl>
    </div>
</template>
