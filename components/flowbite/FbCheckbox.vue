<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, } from "vue";

import { fbCheckbox, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const props = withDefaults(
    defineProps<{
        id?: string;
        name?: string;
        modelValue?: boolean;
        checked?: boolean;
        indeterminate?: boolean;
        disabled?: boolean;
        tabindex?: number | string;
        class?: string;
    }>(),
    {
        indeterminate: false,
        disabled: false,
    }
);

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    change: [value: boolean];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const isControlled = computed(() => props.modelValue === undefined);

const isChecked = computed(() =>
    isControlled.value ? Boolean(props.checked) : Boolean(props.modelValue)
);

const className = computed(() => props.class);

async function syncIndeterminate (): Promise<void> {
    await nextTick();

    if (inputRef.value) {
        inputRef.value.indeterminate = props.indeterminate;
    }
}

watch(
    () => [props.modelValue, props.checked, isControlled.value],
    async () => {
        await syncIndeterminate();

        if (inputRef.value && isControlled.value) {
            inputRef.value.checked = isChecked.value;
        }
    }
);

onMounted(() => {
    syncIndeterminate();
});

function handleChange (event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (! isControlled.value) {
        emit("update:modelValue", checked);
    }

    emit("change", checked);
}
</script>

<template>
    <input
        :id="id"
        ref="inputRef"
        type="checkbox"
        :name="name"
        :checked="isChecked"
        :disabled="disabled"
        :tabindex="tabindex"
        :class="cn(fbCheckbox, className)"
        @change="handleChange" >
</template>
