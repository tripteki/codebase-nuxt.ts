<script setup lang="ts">
import { type HTMLAttributes, computed, } from "vue";
import { CheckboxIndicator, CheckboxRoot, } from "radix-vue";

import { cn, } from "@/lib/utils";

defineOptions ({
    inheritAttrs: false,
});

const props = defineProps<{
    class?: HTMLAttributes["class"];
    modelValue?: boolean | "indeterminate";
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
}>();

const classes = computed (() => cn (
    "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    props.class
));

function onUpdate (value: boolean | "indeterminate"): void
{
    emit ("update:modelValue", value === true);
}
</script>

<template>
    <CheckboxRoot
        v-bind="$attrs"
        data-slot="checkbox"
        :checked="modelValue"
        :class="classes"
        @update:checked="onUpdate"
    >
        <CheckboxIndicator
            data-slot="checkbox-indicator"
            class="flex items-center justify-center text-current transition-none"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-3.5"
            >
                <path d="M20 6 9 17l-5-5" />
            </svg>
        </CheckboxIndicator>
    </CheckboxRoot>
</template>
