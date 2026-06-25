<script setup lang="ts">
import { computed, } from "vue";
import { useTranslation, } from "#imports";

import { fbAlertDanger, } from "@/lib/flowbite-classes";

const props = withDefaults(
    defineProps<{
        errors?: string[];
        message?: string;
        title?: string;
    }>(),
    {
        errors: () => [],
    }
);

const { t, } = useTranslation ("common");

const items = computed (() => {
    if (props.message) {
        return [props.message];
    }

    return props.errors.filter ((error) => error !== "");
});

const resolvedTitle = computed (() => {
    if (props.title) {
        return props.title;
    }

    return items.value.length > 1 ? t ("something_went_wrong") : undefined;
});
</script>

<template>
    <div v-if="items.length > 0" :class="fbAlertDanger" role="alert">
        <svg
            class="me-3 inline h-4 w-4 shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
        </svg>
        <div>
            <span v-if="resolvedTitle" class="font-medium">
                {{ resolvedTitle }}
            </span>
            <p v-if="items.length === 1">
                {{ items[0] }}
            </p>
            <ul v-else class="mt-1.5 list-inside list-disc">
                <li
                    v-for="(error, index) in Array.from (new Set (items))"
                    :key="index">
                    {{ error }}
                </li>
            </ul>
        </div>
    </div>
</template>
