<script setup lang="ts">
import { fbSkeleton, } from "@/lib/flowbite-classes";

withDefaults (
    defineProps<{
        className?: string;
        style?: Record<string, string>;
    }> (),
    {
        className: "h-4 w-full",
        style: () => ({}),
    },
);
</script>

<template>
    <div aria-hidden="true" :class="[fbSkeleton, className,]" :style="style" />
</template>
