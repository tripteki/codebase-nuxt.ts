<script setup lang="ts">
import { reactive, ref, } from "vue";
import { navigateTo, useTranslation, } from "#imports";

import AdminFormActions from "@/components/admin/AdminFormActions.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import { useAdminPermissions, } from "@/composables/useAdminPermissions";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { fbCard, fbInput, } from "@/lib/flowbite-classes";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { createDefaultPermissionForm, } from "@/types/admin/permission";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { create, } = useAdminPermissions ();
const form = reactive (createDefaultPermissionForm ());
const error = ref ("");
const saving = ref (false);

async function submit (): Promise<void> {
    error.value = "";
    saving.value = true;
    const result = await create (form);

    saving.value = false;

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    await navigateTo ("/admin/permissions");
}
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('permissions_create')" :description="t ('permissions_create_description')">
        <AlertError :message="error" />
        <form :class="[fbCard, 'max-w-3xl space-y-6',]" @submit.prevent="submit">
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <FbLabel html-for="permission-create-name">{{ t ("name") }}</FbLabel>
                    <FbInput id="permission-create-name" v-model="form.name" name="name" icon="none" required :placeholder="t ('permissions_name_placeholder')" />
                </div>
                <div>
                    <FbLabel html-for="permission-create-guard">{{ t ("permissions_column_guard") }}</FbLabel>
                    <select id="permission-create-guard" v-model="form.guard_name" :class="fbInput">
                        <option value="web">web</option>
                        <option value="api">api</option>
                    </select>
                </div>
            </div>
            <AdminFormActions cancel-to="/admin/permissions" :submit-label="t ('save')" :processing="saving" />
        </form>
    </AdminFrame>
</template>
