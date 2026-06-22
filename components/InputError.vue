<script setup lang="ts">
import { computed, } from "vue";

import { cn, } from "@/lib/utils";

const props = defineProps<{
    message?: string;
    class?: string;
}>();

const classes = computed (() =>
    cn ("text-sm text-red-600 dark:text-red-400", props.class)
);
</script>

<template>
    <p v-if="message" :class="classes">
        {{ message }}
    </p>
</template>
