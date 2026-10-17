<script setup lang="ts">
import { onMounted, reactive, ref, } from "vue";
import { navigateTo, useRoute, useTranslation, } from "#imports";

import AdminFormActions from "@/components/admin/AdminFormActions.vue";
import AdminFormSkeleton from "@/components/admin/AdminFormSkeleton.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import { useAdminPermissions, } from "@/composables/useAdminPermissions";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { fbCard, fbInput, } from "@/lib/flowbite-classes";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { createDefaultPermissionForm, type AdminPermission, } from "@/types/admin/permission";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { get, update, } = useAdminPermissions ();
const form = reactive (createDefaultPermissionForm ());
const error = ref ("");
const ready = ref (false);
const saving = ref (false);

onMounted (async () => {
    const result = await get (String (route.params.id));

    if (result.isSuccess) {
        const permission = result.data as AdminPermission;

        form.name = permission.name;
        form.guard_name = permission.guard_name === "api" ? "api" : "web";
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

    await navigateTo (`/admin/permissions/${route.params.id}`);
}
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('permissions_edit')" :description="t ('permissions_edit_description')">
        <AlertError :message="error" />
        <AdminFormSkeleton v-if="! ready" :fields="3" />
        <form v-else :class="[fbCard, 'max-w-3xl space-y-6',]" @submit.prevent="submit">
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <FbLabel html-for="permission-edit-name">{{ t ("name") }}</FbLabel>
                    <FbInput id="permission-edit-name" v-model="form.name" name="name" icon="none" required :placeholder="t ('permissions_name_placeholder')" />
                </div>
                <div>
                    <FbLabel html-for="permission-edit-guard">{{ t ("permissions_column_guard") }}</FbLabel>
                    <select id="permission-edit-guard" v-model="form.guard_name" :class="fbInput">
                        <option value="web">web</option>
                        <option value="api">api</option>
                    </select>
                </div>
            </div>
            <AdminFormActions :cancel-to="`/admin/permissions/${route.params.id}`" :submit-label="t ('save')" :processing="saving" />
        </form>
    </AdminFrame>
</template>
