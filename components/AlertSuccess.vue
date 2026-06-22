<script setup lang="ts">
import { type HTMLAttributes, } from "vue";

import { Alert, AlertDescription, AlertTitle, } from "@/components/ui/alert";
import { cn, } from "@/lib/utils";

const props = defineProps<{
    message?: string;
    title?: string;
    class?: HTMLAttributes["class"];
}>();
</script>

<template>
    <Alert v-if="message" variant="success" :class="cn ('mb-4', props.class)">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M21.801 10A10 10 0 1 1 17 3.335" />
            <path d="m9 11 3 3L22 4" />
        </svg>
        <AlertTitle v-if="title">
            {{ title }}
        </AlertTitle>
        <AlertDescription>
            <p>{{ message }}</p>
        </AlertDescription>
    </Alert>
</template>
