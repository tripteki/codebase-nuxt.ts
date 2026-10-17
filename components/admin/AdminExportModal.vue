<script setup lang="ts">
import { ref, watch, } from "vue";
import { useTranslation, } from "#imports";

import AdminFormModal from "@/components/admin/AdminFormModal.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { fbInputIconWrap, fbLabel, fbSelect, } from "@/lib/flowbite-classes";

const props = withDefaults (defineProps<{
    open: boolean;
    formats: string[];
    i18nPrefix?: string;
    processing?: boolean;
}> (), {
    i18nPrefix: "users",
    processing: false,
});

const emit = defineEmits<{
    "update:open": [value: boolean];
    confirm: [format: string];
}> ();

const { t, } = useTranslation ("common");
const format = ref ("csv");

watch (() => props.open, (isOpen) => {
    if (isOpen) {
        format.value = props.formats[0] || "csv";
    }
});

function close (): void {
    emit ("update:open", false);
}
</script>

<template>
    <AdminFormModal
        :open="open"
        :title="t (`${i18nPrefix}_export_title`)"
        title-id="admin-export-title"
        :description="t (`${i18nPrefix}_export_description`)"
        :processing="processing"
        @update:open="emit ('update:open', $event)">
        <form class="space-y-4" @submit.prevent="emit ('confirm', format)">
            <div>
                <label for="admin-export-format" :class="fbLabel">{{ t (`${i18nPrefix}_export_select_format`) }}</label>
                <div class="relative">
                    <span :class="fbInputIconWrap">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </span>
                    <select id="admin-export-format" v-model="format" :class="[fbSelect, 'ps-10',]" :disabled="processing">
                        <option v-for="item in formats" :key="item" :value="item">{{ item.toUpperCase () }}</option>
                    </select>
                </div>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                <FbButton variant="outline" type="button" :disabled="processing" @click="close">{{ t ("cancel") }}</FbButton>
                <FbButton type="submit" :disabled="processing">{{ t ("export") }}</FbButton>
            </div>
        </form>
    </AdminFormModal>
</template>
