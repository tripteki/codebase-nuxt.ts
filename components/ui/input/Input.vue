<script setup lang="ts">
import { type InputHTMLAttributes, computed, } from "vue";

import { cn, } from "@/lib/utils";

defineOptions ({
    inheritAttrs: false,
});

const model = defineModel<string | number>({
    default: "",
});

const props = defineProps<{
    class?: InputHTMLAttributes["class"];
    type?: InputHTMLAttributes["type"];
}>();

const classes = computed (() =>
    cn (
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.class
    )
);
</script>

<template>
    <input v-model="model" :type="type" :class="classes" v-bind="$attrs" />
</template>
