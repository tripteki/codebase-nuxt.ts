<script setup lang="ts">
import { onMounted, ref, } from "vue";
import { useRoute, useTranslation, } from "#imports";

import AdminDetailSkeleton from "@/components/admin/AdminDetailSkeleton.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { useAdminRoles, } from "@/composables/useAdminRoles";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { fbAdminShowBack, fbCard, fbMuted, fbShowChip, fbShowLabel, } from "@/lib/flowbite-classes";
import { definePageAuthed, } from "@/lib/define-page-auth";
import type { AdminRole, } from "@/types/admin/role";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { get, } = useAdminRoles ();
const role = ref<AdminRole | null> (null);
const error = ref ("");

onMounted (async () => {
    const result = await get (String (route.params.id));

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    role.value = result.data as AdminRole;
});
</script>

<template>
    <AdminFrame v-if="canRender" :title="role?.name || t ('roles')" :description="role?.guard_name">
        <AlertError :message="error" />
        <AdminDetailSkeleton v-if="! role && ! error" :fields="4" />
        <div v-if="role" :class="[fbCard, 'space-y-4',]">
            <p v-if="role.is_protected" class="text-center">
                <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-white">{{ t ("roles_protected_badge") }}</span>
            </p>
            <p :class="fbShowLabel">{{ t ("roles_permissions_title") }}</p>
            <ul v-if="role.permissions?.length" class="flex flex-wrap justify-center gap-2">
                <li v-for="permission in role.permissions" :key="permission.id" :class="[fbShowChip, 'font-mono text-xs',]">{{ permission.name }}</li>
            </ul>
            <p v-else :class="fbMuted" class="text-center text-sm">{{ t ("roles_permissions_empty") }}</p>
            <div :class="[fbAdminShowBack, 'flex flex-wrap gap-2',]">
                <FbButton variant="outline" to="/admin/roles">{{ t ("back_to_roles") }}</FbButton>
                <FbButton v-if="! role.is_protected" variant="outline" :to="`/admin/roles/${role.id}/edit`">{{ t ("edit") }}</FbButton>
            </div>
        </div>
    </AdminFrame>
</template>
