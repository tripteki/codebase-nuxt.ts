<script setup lang="ts">
import { type HTMLAttributes, computed, } from "vue";

import { cn, } from "@/lib/utils";

const props = defineProps<{
    class?: HTMLAttributes["class"];
}>();

const classes = computed (() =>
    cn (
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        props.class
    )
);
</script>

<template>
    <div data-slot="alert-title" :class="classes">
        <slot />
    </div>
</template>
