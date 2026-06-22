<script setup lang="ts">
import { type HTMLAttributes, computed, } from "vue";
import { cva, type VariantProps, } from "class-variance-authority";

import { cn, } from "@/lib/utils";

const alertVariants = cva (
    "relative grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 rounded-lg border px-4 py-3.5 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-current",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                destructive:
                    "border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90",
                success:
                    "border-success/40 bg-success-muted text-success-foreground [&>svg]:text-success-foreground *:data-[slot=alert-description]:text-success-foreground/90",
                warning:
                    "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400 *:data-[slot=alert-description]:text-amber-900/90 dark:*:data-[slot=alert-description]:text-amber-200/90",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

type AlertVariants = VariantProps<typeof alertVariants>;

const props = defineProps<{
    class?: HTMLAttributes["class"];
    variant?: AlertVariants["variant"];
}>();

const classes = computed (() =>
    cn (alertVariants ({ variant: props.variant }), props.class)
);
</script>

<template>
    <div data-slot="alert" role="alert" :class="classes">
        <slot />
    </div>
</template>
