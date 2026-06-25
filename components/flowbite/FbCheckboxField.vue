<script setup lang="ts">
import FbCheckbox from "@/components/flowbite/FbCheckbox.vue";
import { fbCheckboxLabel, fbCheckboxRow, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const model = defineModel<boolean>({ default: false });

withDefaults(
    defineProps<{
        id: string;
        name?: string;
        indeterminate?: boolean;
        disabled?: boolean;
        tabindex?: number | string;
        wrapperClass?: string;
        labelClass?: string;
    }>(),
    {
        indeterminate: false,
        disabled: false,
    }
);
</script>

<template>
    <div :class="cn(fbCheckboxRow, wrapperClass)">
        <FbCheckbox
            :id="id"
            v-model="model"
            :name="name"
            :indeterminate="indeterminate"
            :disabled="disabled"
            :tabindex="tabindex" />
        <label
            :for="id"
            :class="cn(fbCheckboxLabel, labelClass, disabled && 'cursor-not-allowed opacity-50')">
            <slot />
        </label>
    </div>
</template>
