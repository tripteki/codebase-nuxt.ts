<script setup lang="ts">
import { computed, } from "vue";

import FbButton from "@/components/flowbite/FbButton.vue";

const props = defineProps<{
    icon: "view" | "edit" | "delete" | "deactivate" | "activate" | "verify";
    to?: string;
    disabled?: boolean;
}> ();

const variant = computed (() => {
    if (props.icon === "delete" || props.icon === "deactivate") {
        return "danger";
    }

    if (props.icon === "edit") {
        return "tertiary";
    }

    if (props.icon === "activate" || props.icon === "verify") {
        return "secondary";
    }

    return "primary";
});
</script>

<template>
    <FbButton
        class="whitespace-nowrap"
        :variant="variant"
        size="xs"
        :to="to"
        :disabled="disabled"
        type="button">
        <slot />
    </FbButton>
</template>
