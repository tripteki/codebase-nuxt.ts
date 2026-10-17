<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbButton from "@/components/flowbite/FbButton.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";

withDefaults (defineProps<{
    cancelTo: string;
    submitLabel: string;
    processing?: boolean;
}> (), {
    processing: false,
});

const { t, } = useTranslation ("common");
</script>

<template>
    <div class="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <FbButton variant="outline" type="button" :to="cancelTo" :disabled="processing">
            {{ t ("cancel") }}
        </FbButton>
        <FbButton type="submit" class="gap-2" :disabled="processing">
            <FbSpinner v-if="processing" class="h-4 w-4" />
            {{ submitLabel }}
        </FbButton>
    </div>
</template>
