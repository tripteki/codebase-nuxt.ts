<script setup lang="ts">
import { computed, } from "vue";

const props = defineProps<{
    tone: "active" | "pending" | "danger" | "muted";
}> ();

const dotClass = computed (() => {
    if (props.tone === "active") {
        return "bg-emerald-500";
    }

    if (props.tone === "pending") {
        return "bg-amber-400";
    }

    if (props.tone === "danger") {
        return "bg-red-500";
    }

    return "bg-gray-400";
});
</script>

<template>
    <span class="inline-flex items-center">
        <span class="me-2 h-2.5 w-2.5 shrink-0 rounded-full" :class="dotClass" />
        <slot />
    </span>
</template>
