<script setup lang="ts">
import { computed, } from "vue";

import { fbInlineLabel, fbLabel, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const props = withDefaults(
    defineProps<{
        htmlFor?: string;
        variant?: "field" | "inline";
        class?: string;
    }>(),
    {
        variant: "field",
    }
);

const className = computed(() => props.class);

const labelClass = computed(() =>
    cn (props.variant === "inline" ? fbInlineLabel : fbLabel, className.value)
);
</script>

<template>
    <label :for="htmlFor" :class="labelClass">
        <slot />
    </label>
</template>
