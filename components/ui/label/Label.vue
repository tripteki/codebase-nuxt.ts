<script setup lang="ts">
import { type HTMLAttributes, computed, } from "vue";
import { Label, } from "radix-vue";

import { cn, } from "@/lib/utils";

const props = defineProps<{
    class?: HTMLAttributes["class"];
    htmlFor?: string;
}>();

const classes = computed (() =>
    cn (
        "text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        props.class
    )
);
</script>

<template>
    <Label data-slot="label" :class="classes" :for="htmlFor">
        <slot />
    </Label>
</template>
