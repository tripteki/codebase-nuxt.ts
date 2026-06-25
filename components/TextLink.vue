<script setup lang="ts">
import { computed, } from "vue";

import { fbLink, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const props = defineProps<{
    to: string;
    class?: string;
}>();

const classes = computed (() => cn (fbLink, props.class));
</script>

<template>
    <NuxtLink :to="to" :class="classes">
        <slot />
    </NuxtLink>
</template>
