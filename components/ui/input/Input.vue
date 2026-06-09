<script setup lang="ts">
import { type InputHTMLAttributes, computed, } from "vue";

import { cn, } from "@/lib/utils";

const props = defineProps<{
    class?: InputHTMLAttributes["class"];
    type?: InputHTMLAttributes["type"];
    modelValue?: string | number;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: string];
}>();

const classes = computed (() => cn (
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    props.class
));

function onInput (event: Event): void
{
    emit ("update:modelValue", (event.target as HTMLInputElement).value);
}
</script>

<template>
    <input
        :type="type"
        :value="modelValue"
        :class="classes"
        v-bind="$attrs"
        @input="onInput"
    >
</template>
