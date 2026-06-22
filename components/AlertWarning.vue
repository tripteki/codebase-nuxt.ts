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
    <Alert v-if="message" variant="warning" :class="cn ('mb-4', props.class)">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path
                d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
        <AlertTitle v-if="title">
            {{ title }}
        </AlertTitle>
        <AlertDescription>
            <p>{{ message }}</p>
        </AlertDescription>
    </Alert>
</template>
