<script setup lang="ts">
import { ref, watch, } from "vue";
import { useTranslation, } from "#imports";

import AdminFilePicker from "@/components/admin/AdminFilePicker.vue";
import AdminFormModal from "@/components/admin/AdminFormModal.vue";
import AdminImportSampleLink from "@/components/admin/AdminImportSampleLink.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import { fbFieldHint, } from "@/lib/flowbite-classes";

const props = withDefaults (defineProps<{
    open: boolean;
    i18nPrefix?: string;
    accept: string;
    processing?: boolean;
}> (), {
    i18nPrefix: "users",
    processing: false,
});

const emit = defineEmits<{
    "update:open": [value: boolean];
    confirm: [file: File];
    sample: [];
}> ();

const { t, } = useTranslation ("common");
const file = ref<File | null> (null);
const fileError = ref ("");

watch (() => props.open, (isOpen) => {
    if (! isOpen) {
        file.value = null;
        fileError.value = "";
    }
});

function close (): void {
    emit ("update:open", false);
}

function submit (): void {
    if (! file.value) {
        fileError.value = t (`${props.i18nPrefix}_import_file_required`);

        return;
    }

    emit ("confirm", file.value);
}
</script>

<template>
    <AdminFormModal
        :open="open"
        :title="t (`${i18nPrefix}_import_title`)"
        title-id="admin-import-title"
        :description="t (`${i18nPrefix}_import_description`)"
        :processing="processing"
        @update:open="emit ('update:open', $event)">
        <form class="space-y-4" @submit.prevent="submit">
            <div>
                <FbLabel html-for="admin-import-file">{{ t (`${i18nPrefix}_import_select_file`) }}</FbLabel>
                <AdminFilePicker
                    id="admin-import-file"
                    :accept="accept"
                    :model-value="file"
                    :invalid="!! fileError"
                    :disabled="processing"
                    @update:model-value="file = $event; fileError = ''" />
                <p v-if="fileError" class="text-sm text-red-600">{{ fileError }}</p>
                <p :class="fbFieldHint">{{ t (`${i18nPrefix}_import_file_hint`) }}</p>
            </div>
            <AdminImportSampleLink :label="t ('download_sample')" :processing="processing" @click="emit ('sample')" />
            <div class="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                <FbButton variant="outline" type="button" :disabled="processing" @click="close">{{ t ("cancel") }}</FbButton>
                <FbButton type="submit" :disabled="processing">{{ t ("import_file") }}</FbButton>
            </div>
        </form>
    </AdminFormModal>
</template>
