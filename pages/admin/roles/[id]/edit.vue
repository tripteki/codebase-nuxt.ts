<script setup lang="ts">
import { onMounted, reactive, ref, } from "vue";
import { navigateTo, useRoute, useTranslation, } from "#imports";

import AdminFormActions from "@/components/admin/AdminFormActions.vue";
import AdminFormSkeleton from "@/components/admin/AdminFormSkeleton.vue";
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
import { createDefaultRoleForm, type AdminRole, } from "@/types/admin/role";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { get, update, } = useAdminRoles ();
const { fetchPermissions, } = useAdminPermissions ();
const form = reactive (createDefaultRoleForm ());
const permissions = ref<AdminPermission[]> ([]);
const error = ref ("");
const ready = ref (false);
const saving = ref (false);

onMounted (async () => {
    const [roleResult, permissionResult] = await Promise.all ([
        get (String (route.params.id)),
        fetchPermissions ({ limitPage: 100, }),
    ]);
    const parsed = parsePaginatedResult<AdminPermission> (permissionResult);

    permissions.value = parsed?.items ?? [];

    if (roleResult.isSuccess) {
        const role = roleResult.data as AdminRole;

        form.name = role.name;
        form.guard_name = role.guard_name === "api" ? "api" : "web";
        form.permission_ids = role.permissions.map ((item) => item.id);
    }

    ready.value = true;
});

async function submit (): Promise<void> {
    error.value = "";
    saving.value = true;
    const result = await update (String (route.params.id), form);

    saving.value = false;

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    await navigateTo (`/admin/roles/${route.params.id}`);
}
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('roles_edit')" :description="t ('roles_edit_description')">
        <AlertError :message="error" />
        <AdminFormSkeleton v-if="! ready" :fields="4" />
        <form v-else :class="[fbCard, 'max-w-3xl space-y-6',]" @submit.prevent="submit">
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <FbLabel html-for="role-edit-name">{{ t ("name") }}</FbLabel>
                    <FbInput id="role-edit-name" v-model="form.name" name="name" icon="none" required :placeholder="t ('roles_name_placeholder')" />
                </div>
                <div>
                    <FbLabel html-for="role-edit-guard">{{ t ("roles_column_guard") }}</FbLabel>
                    <select id="role-edit-guard" v-model="form.guard_name" :class="fbInput">
                        <option value="web">web</option>
                        <option value="api">api</option>
                    </select>
                </div>
            </div>
            <AdminPermissionPicker v-model="form.permission_ids" :permissions="permissions" :guard="form.guard_name" />
            <AdminFormActions :cancel-to="`/admin/roles/${route.params.id}`" :submit-label="t ('save')" :processing="saving" />
        </form>
    </AdminFrame>
</template>
