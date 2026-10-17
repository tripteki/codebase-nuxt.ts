<script setup lang="ts">
import { onMounted, reactive, ref, } from "vue";
import { navigateTo, useTranslation, } from "#imports";

import AdminFormActions from "@/components/admin/AdminFormActions.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AdminPermissionPicker from "@/components/admin/AdminPermissionPicker.vue";
import AlertError from "@/components/AlertError.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import { useAdminPermissions, } from "@/composables/useAdminPermissions";
import { useAdminRoles, } from "@/composables/useAdminRoles";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { parsePaginatedResult, } from "@/composables/useAdminListState";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { fbCard, fbInput, } from "@/lib/flowbite-classes";
import { definePageAuthed, } from "@/lib/define-page-auth";
import type { AdminPermission, } from "@/types/admin/permission";
import { createDefaultRoleForm, } from "@/types/admin/role";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { create, } = useAdminRoles ();
const { fetchPermissions, } = useAdminPermissions ();
const form = reactive (createDefaultRoleForm ());
const permissions = ref<AdminPermission[]> ([]);
const permissionsLoading = ref (true);
const error = ref ("");
const saving = ref (false);

onMounted (async () => {
    const result = await fetchPermissions ({ limitPage: 100, });
    const parsed = parsePaginatedResult<AdminPermission> (result);

    permissions.value = parsed?.items ?? [];
    permissionsLoading.value = false;
});

async function submit (): Promise<void> {
    error.value = "";
    saving.value = true;
    const result = await create (form);

    saving.value = false;

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    await navigateTo ("/admin/roles");
}
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('roles_create')" :description="t ('roles_create_description')">
        <AlertError :message="error" />
        <form :class="[fbCard, 'max-w-3xl space-y-6',]" @submit.prevent="submit">
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <FbLabel html-for="role-create-name">{{ t ("name") }}</FbLabel>
                    <FbInput id="role-create-name" v-model="form.name" name="name" icon="none" required :placeholder="t ('roles_name_placeholder')" />
                </div>
                <div>
                    <FbLabel html-for="role-create-guard">{{ t ("roles_column_guard") }}</FbLabel>
                    <select id="role-create-guard" v-model="form.guard_name" :class="fbInput">
                        <option value="web">web</option>
                        <option value="api">api</option>
                    </select>
                </div>
            </div>
            <AdminPermissionPicker v-model="form.permission_ids" :permissions="permissions" :guard="form.guard_name" :loading="permissionsLoading" />
            <AdminFormActions cancel-to="/admin/roles" :submit-label="t ('save')" :processing="saving" />
        </form>
    </AdminFrame>
</template>
