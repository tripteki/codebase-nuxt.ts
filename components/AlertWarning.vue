<script setup lang="ts">
import { type HTMLAttributes, } from "vue";

import { fbAlertWarning, } from "@/lib/flowbite-classes";
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
        :class="cn (fbAlertWarning, props.class)"
        role="alert">
        <svg
            class="me-3 inline h-4 w-4 shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
        </svg>
        <div>
            <span v-if="title" class="font-medium">{{ title }}</span>
            <p>{{ message }}</p>
        </div>
    </div>
</template>
