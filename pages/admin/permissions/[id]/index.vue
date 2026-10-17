<script setup lang="ts">
import { onMounted, ref, } from "vue";
import { useRoute, useTranslation, } from "#imports";

import AdminDetailSkeleton from "@/components/admin/AdminDetailSkeleton.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { useAdminPermissions, } from "@/composables/useAdminPermissions";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { fbAdminShowBack, fbCard, fbShowLabel, fbShowValue, } from "@/lib/flowbite-classes";
import { definePageAuthed, } from "@/lib/define-page-auth";
import type { AdminPermission, } from "@/types/admin/permission";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { get, } = useAdminPermissions ();
const permission = ref<AdminPermission | null> (null);
const error = ref ("");

onMounted (async () => {
    const result = await get (String (route.params.id));

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    permission.value = result.data as AdminPermission;
});
</script>

<template>
    <AdminFrame v-if="canRender" :title="permission?.name || t ('permissions')" :description="permission?.guard_name">
        <AlertError :message="error" />
        <AdminDetailSkeleton v-if="! permission && ! error" :fields="4" />
        <div v-if="permission" :class="[fbCard, 'grid gap-4 md:grid-cols-2',]">
            <div>
                <p :class="fbShowLabel">{{ t ("name") }}</p>
                <div :class="fbShowValue">
                    {{ permission.name }}
                    <span v-if="permission.is_protected" class="ms-2 rounded bg-white/70 px-2 py-0.5 text-xs dark:bg-gray-800">{{ t ("permissions_protected_badge") }}</span>
                </div>
            </div>
            <div>
                <p :class="fbShowLabel">{{ t ("permissions_column_guard") }}</p>
                <p :class="fbShowValue">{{ permission.guard_name }}</p>
            </div>
            <div :class="[fbAdminShowBack, 'flex flex-wrap gap-2 md:col-span-2',]">
                <FbButton variant="outline" to="/admin/permissions">{{ t ("back_to_permissions") }}</FbButton>
                <FbButton v-if="! permission.is_protected" variant="outline" :to="`/admin/permissions/${permission.id}/edit`">{{ t ("edit") }}</FbButton>
            </div>
        </div>
    </AdminFrame>
</template>
