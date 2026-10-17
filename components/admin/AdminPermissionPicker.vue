<script setup lang="ts">
import { computed, ref, } from "vue";
import { useTranslation, } from "#imports";

import FbCheckbox from "@/components/flowbite/FbCheckbox.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import { groupAdminPermissions, } from "@/lib/admin-permission-groups";
import { fbMuted, } from "@/lib/flowbite-classes";
import type { AdminPermission, } from "@/types/admin/permission";

const props = defineProps<{
    permissions: AdminPermission[];
    modelValue: string[];
    guard: string;
    loading?: boolean;
}> ();

const emit = defineEmits<{
    "update:modelValue": [ids: string[]];
}> ();

const { t, } = useTranslation ("common");
const search = ref ("");
const groups = computed (() => groupAdminPermissions (props.permissions, props.guard, search.value));

function isChecked (id: string): boolean {
    return props.modelValue.includes (id);
}

function setChecked (id: string, checked: boolean): void {
    if (checked && ! isChecked (id)) {
        emit ("update:modelValue", [ ...props.modelValue, id, ]);

        return;
    }

    if (! checked) {
        emit ("update:modelValue", props.modelValue.filter ((item) => item !== id));
    }
}

function permissionIds (items: AdminPermission[]): string[] {
    return items.map ((item) => item.id);
}

function groupChecked (ids: string[]): boolean {
    return ids.length > 0 && ids.every ((id) => isChecked (id));
}

function groupIndeterminate (ids: string[]): boolean {
    const selected = ids.filter ((id) => isChecked (id)).length;

    return selected > 0 && selected < ids.length;
}

function toggleGroup (ids: string[], checked: boolean): void {
    if (checked) {
        emit ("update:modelValue", [...new Set ([ ...props.modelValue, ...ids, ])]);

        return;
    }

    emit ("update:modelValue", props.modelValue.filter ((id) => ! ids.includes (id)));
}

</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t ("roles_permissions_title") }}</h3>
                <p :class="fbMuted">{{ t ("roles_permissions_description") }}</p>
            </div>
            <FbInput v-model="search" type="search" class="sm:max-w-xs" :placeholder="t ('roles_permissions_search')" />
        </div>
        <div v-if="loading" class="h-24 animate-pulse rounded-lg border border-dashed border-gray-200 dark:border-gray-700" />
        <p v-else-if="! groups.length" :class="[fbMuted, 'rounded-lg border border-dashed border-gray-200 p-4 dark:border-gray-700',]">
            {{ t ("roles_permissions_empty") }}
        </p>
        <div v-else class="space-y-4">
            <div v-for="group in groups" :key="group.key" class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <label class="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <FbCheckbox
                        :model-value="groupChecked (permissionIds (group.permissions))"
                        :indeterminate="groupIndeterminate (permissionIds (group.permissions))"
                        @update:model-value="toggleGroup (permissionIds (group.permissions), $event)" />
                    <span class="capitalize">{{ group.key }}</span>
                </label>
                <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <label
                        v-for="permission in group.permissions"
                        :key="permission.id"
                        class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <FbCheckbox :model-value="isChecked (permission.id)" @update:model-value="setChecked (permission.id, $event)" />
                        {{ permission.name }}
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>
