<script setup lang="ts">
import { computed, } from "vue";

import {
    fbButtonDanger,
    fbButtonGhost,
    fbButtonOutline,
    fbButtonPrimary,
    fbButtonSecondary,
} from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const props = withDefaults(
    defineProps<{
        type?: "button" | "submit" | "reset";
        variant?: "primary" | "outline" | "ghost" | "danger" | "secondary";
        size?: "default" | "sm" | "lg" | "icon";
        disabled?: boolean;
        to?: string;
        href?: string;
        class?: string;
    }>(),
    {
        type: "button",
        variant: "primary",
        size: "default",
    }
);

const className = computed(() => props.class);

const variantClass = computed(() => {
    switch (props.variant) {
        case "outline":
            return fbButtonOutline;
        case "ghost":
            return fbButtonGhost;
        case "danger":
            return fbButtonDanger;
        case "secondary":
            return fbButtonSecondary;
        default:
            return fbButtonPrimary;
    }
});

const sizeClass = computed(() => {
    if (props.size === "lg") {
        return "px-6 py-3 text-base";
    }

    if (props.size === "sm") {
        return "px-3 py-1.5 text-xs";
    }

    if (props.size === "icon") {
        return "h-10 w-10 p-2.5";
    }

    return "";
});
</script>

<template>
    <NuxtLink
        v-if="to"
        :to="to"
        :class="cn(variantClass, sizeClass, className)">
        <slot />
    </NuxtLink>
    <a
        v-else-if="href"
        :href="href"
        :class="cn(variantClass, sizeClass, className)"
        target="_blank"
        rel="noopener noreferrer">
        <slot />
    </a>
    <button
        v-else
        :type="type"
        :disabled="disabled"
        :class="cn(variantClass, sizeClass, className)">
        <slot />
    </button>
</template>
