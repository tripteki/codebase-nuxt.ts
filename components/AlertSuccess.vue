<script setup lang="ts">
import { type HTMLAttributes, } from "vue";

import { fbAlertSuccess, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const props = defineProps<{
    message?: string;
    title?: string;
    class?: HTMLAttributes["class"];
}>();
</script>

<template>
    <div
        v-if="message"
        :class="cn (fbAlertSuccess, props.class)"
        role="alert">
        <svg
            class="me-3 inline h-4 w-4 shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
        </svg>
        <div>
            <span v-if="title" class="font-medium">{{ title }}</span>
            <p>{{ message }}</p>
        </div>
    </div>
</template>
