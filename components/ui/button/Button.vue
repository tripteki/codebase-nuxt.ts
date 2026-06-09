<script setup lang="ts">
import { type HTMLAttributes, computed, } from "vue";
import { Primitive, type AsTag, } from "radix-vue";
import { type VariantProps, } from "class-variance-authority";

import { buttonVariants, } from "@/components/ui/button/buttonVariants";
import { cn, } from "@/lib/utils";

type ButtonVariants = VariantProps<typeof buttonVariants>;

const props = withDefaults (defineProps<{
    class?: HTMLAttributes["class"];
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    asChild?: boolean;
}> (), {
    type: "button",
    variant: "default",
    size: "default",
    asChild: false,
});

const classes = computed (() => cn (buttonVariants ({ variant: props.variant, size: props.size, }), props.class));
</script>

<template>
    <Primitive
        :as="asChild ? undefined : ('button' as AsTag)"
        :as-child="asChild"
        :type="asChild ? undefined : type"
        :disabled="disabled"
        :class="classes"
    >
        <slot />
    </Primitive>
</template>
