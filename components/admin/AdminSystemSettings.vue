<script setup lang="ts">
import { onMounted, ref, } from "vue";
import { useTranslation, } from "#imports";

import AdminFilePicker from "@/components/admin/AdminFilePicker.vue";
import AdminFormSkeleton from "@/components/admin/AdminFormSkeleton.vue";
import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import { useAdminSettings, } from "@/composables/useAdminSettings";
import { adminSectionClass, adminSectionFooterClass, } from "@/lib/admin-form-classes";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { fbInput, fbLink, } from "@/lib/flowbite-classes";
import type { AdminSetting, AdminSettingDraft, } from "@/types/admin/setting";

const { t, } = useTranslation ("common");
const { fetchSettings, saveSettings, } = useAdminSettings ();
const rows = ref<AdminSettingDraft[]> ([]);
const message = ref ("");
const error = ref ("");
const isLoading = ref (true);
const isSaving = ref (false);

function blankRow (): AdminSettingDraft {
    return {
        id: "",
        key: "",
        value: "",
        value_kind: "text",
        value_url: null,
        file: null,
        remove: false,
    };
}

function toDraft (row: AdminSetting): AdminSettingDraft {
    return {
        id: row.id,
        key: row.key,
        value: row.value ?? "",
        value_kind: row.value_kind === "file" ? "file" : "text",
        value_url: row.value_url,
        file: null,
        remove: false,
    };
}

function readRows (payload: unknown): AdminSetting[] {
    if (! payload || typeof payload !== "object") {
        return [];
    }

    const data = (payload as { data?: unknown }).data;

    return Array.isArray (data) ? data as AdminSetting[] : [];
}

async function load (): Promise<void> {
    isLoading.value = true;
    error.value = "";
    const result = await fetchSettings ();

    isLoading.value = false;

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    const loaded = readRows (result.data).map (toDraft);

    rows.value = loaded.length > 0 ? loaded : [blankRow (),];
}

function addRow (): void {
    rows.value.push (blankRow ());
}

function removeRow (index: number): void {
    const row = rows.value[index];

    if (! row) {
        return;
    }

    if (row.id) {
        row.remove = true;
        row.file = null;
    } else {
        rows.value.splice (index, 1);
    }

    if (rows.value.filter ((entry) => ! entry.remove).length === 0) {
        rows.value.push (blankRow ());
    }
}

function onFile (row: AdminSettingDraft, file: File | null): void {
    row.file = file;
    row.value_kind = "file";
}

async function save (): Promise<void> {
    message.value = "";
    error.value = "";
    isSaving.value = true;
    const result = await saveSettings (rows.value);

    isSaving.value = false;

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    rows.value = readRows (result.data).map (toDraft);
    message.value = t ("saved");
}

onMounted (() => {
    void load ();
});
</script>

<template>
    <div class="space-y-6">
        <AlertSuccess :message="message" />
        <AlertError :message="error" />
        <AdminFormSkeleton v-if="isLoading" :fields="4" />
        <template v-else>
            <div
                v-for="(row, index) in rows"
                v-show="! row.remove"
                :key="row.id || `new-${index}`"
                :class="adminSectionClass">
                <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-12">
                    <div class="md:col-span-4">
                        <FbLabel :html-for="`setting-key-${index}`">{{ t ("settings_column_key") }}</FbLabel>
                        <FbInput :id="`setting-key-${index}`" v-model="row.key" name="key" :placeholder="t ('settings_key_placeholder')" />
                    </div>
                    <div class="space-y-3 md:col-span-7">
                        <FbLabel :html-for="`setting-kind-${index}`">{{ t ("settings_column_value") }}</FbLabel>
                        <select :id="`setting-kind-${index}`" v-model="row.value_kind" :class="fbInput">
                            <option value="text">text</option>
                            <option value="file">file</option>
                        </select>
                        <FbInput
                            v-if="row.value_kind === 'text'"
                            :id="`setting-value-${index}`"
                            v-model="row.value"
                            name="value"
                            :placeholder="t ('settings_value_placeholder')" />
                        <div v-else class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/40">
                            <div v-if="row.value_url" class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
                                <a :href="row.value_url" target="_blank" rel="noopener noreferrer" :class="[fbLink, 'min-w-0 truncate text-xs',]">
                                    {{ t ("settings_open_file") }}
                                </a>
                            </div>
                            <AdminFilePicker
                                :id="`setting-file-${index}`"
                                accept="image/jpeg,image/png,image/gif,image/webp,image/x-icon,.ico"
                                :model-value="row.file"
                                :selected-label="row.file ? undefined : (row.value || undefined)"
                                @update:model-value="onFile (row, $event)" />
                        </div>
                    </div>
                    <div class="flex items-center justify-center md:col-span-1 md:justify-end md:self-center">
                        <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
                            :title="t ('delete')"
                            :aria-label="t ('delete')"
                            @click="removeRow (index)">
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </template>
    <div v-if="! isLoading" :class="adminSectionFooterClass">
        <FbButton variant="outline" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs" :disabled="isSaving" @click="addRow">
            {{ t ("settings_add_row") }}
        </FbButton>
        <FbButton type="button" class="inline-flex items-center gap-2 px-3 py-1.5 text-xs" :disabled="isSaving" @click="save">
            <FbSpinner v-if="isSaving" class="h-4 w-4" />
            {{ t ("save_changes") }}
        </FbButton>
    </div>
    </div>
</template>
