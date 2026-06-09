<script setup lang="ts">
import { computed, } from "vue";

import { cn, } from "@/lib/utils";

const props = defineProps<{
    to: string;
    class?: string;
}>();

const classes = computed (() => cn (
    "text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:!decoration-current dark:decoration-neutral-500",
    props.class
));
</script>

<template>
    <NuxtLink
        :to="to"
        :class="classes"
    >
        <slot />
    </NuxtLink>
</template>
