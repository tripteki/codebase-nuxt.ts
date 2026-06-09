<script setup lang="ts">
import { computed, } from "vue";
import { useTranslation, } from "#imports";

import { Alert, AlertDescription, AlertTitle, } from "@/components/ui/alert";

const props = withDefaults (defineProps<{
    errors?: string[];
    message?: string;
    title?: string;
}> (), {
    errors: () => [],
});

const { t, } = useTranslation ("common");

const items = computed (() =>
{
    if (props.message)
    {
        return [ props.message, ];
    }

    return props.errors.filter ((error) => error !== "");
});

const resolvedTitle = computed (() =>
{
    if (props.title)
    {
        return props.title;
    }

    return items.value.length > 1 ? t ("something_went_wrong") : undefined;
});
</script>

<template>
    <Alert
        v-if="items.length > 0"
        variant="destructive"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <AlertTitle v-if="resolvedTitle">
            {{ resolvedTitle }}
        </AlertTitle>
        <AlertDescription>
            <p v-if="items.length === 1">
                {{ items[0] }}
            </p>
            <ul
                v-else
                class="list-inside list-disc text-sm"
            >
                <li
                    v-for="(error, index) in Array.from(new Set(items))"
                    :key="index"
                >
                    {{ error }}
                </li>
            </ul>
        </AlertDescription>
    </Alert>
</template>
