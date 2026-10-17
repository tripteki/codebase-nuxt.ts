<script setup lang="ts">
import { computed, onMounted, ref, } from "vue";
import { useRoute, useTranslation, } from "#imports";

import AdminConfirmModal from "@/components/admin/AdminConfirmModal.vue";
import AdminDetailSkeleton from "@/components/admin/AdminDetailSkeleton.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AdminStatusDot from "@/components/admin/AdminStatusDot.vue";
import AdminUserSteps from "@/components/admin/AdminUserSteps.vue";
import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminUsers, } from "@/composables/useAdminUsers";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { formatStamp, } from "@/lib/format-display";
import { fbAdminShowBack, fbCard, } from "@/lib/flowbite-classes";
import { resolveSessionUserId, } from "@/lib/session-user";
import {
    canMutateAdminAccount,
    resolveUserAccountStatus,
    resolveUserDisplayName,
    userStatusTone,
    type AdminUser,
} from "@/types/admin/user";

definePageAuthed ();

const route = useRoute ();
const { data: sessionData, } = useAuth ();
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { can, isSuperadmin, } = useAdminAccesses ();
const { get, verify, activate, deactivate, } = useAdminUsers ();
const user = ref<AdminUser | null> (null);
const error = ref ("");
const message = ref ("");
const confirmOpen = ref (false);
const confirmMessage = ref ("");
const confirmAction = ref<(() => Promise<{ isSuccess: boolean; error: unknown; }>) | null> (null);
const selfId = computed (() => resolveSessionUserId (sessionData.value));
const canChange = computed (() =>
    user.value ? canMutateAdminAccount (selfId.value, isSuperadmin.value, user.value) : false
);
const tab = ref ("profile");
const steps = computed (() => [
    { key: "profile", label: t ("users_tab_profile"), },
    { key: "access", label: t ("users_tab_access"), },
]);
const showValue = "block w-full rounded-lg bg-gray-50 p-2.5 text-center text-sm text-gray-900 dark:bg-gray-700 dark:text-white";

function roleLabel (key: string): string {
    const translated = t (`role_${key}`);

    if (translated === `role_${key}` || translated.endsWith (`.role_${key}`)) {
        return key;
    }

    return translated;
}

async function load (): Promise<void> {
    const result = await get (String (route.params.id));

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    user.value = result.data as AdminUser;
}

const confirmDanger = ref (false);

function ask (messageText: string, action: () => Promise<{ isSuccess: boolean; error: unknown; }>, danger = false): void {
    confirmMessage.value = messageText;
    confirmDanger.value = danger;
    confirmAction.value = action;
    confirmOpen.value = true;
}

async function runConfirm (): Promise<void> {
    const action = confirmAction.value;

    confirmOpen.value = false;
    confirmAction.value = null;

    if (action) {
        await run (action);
    }
}

async function run (action: () => Promise<{ isSuccess: boolean; error: unknown; }>): Promise<void> {
    message.value = "";
    error.value = "";
    const result = await action ();

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    message.value = t ("saved");
    await load ();
}

onMounted (() => {
    void load ();
});
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('users_view_title')" :description="user?.email">
        <AlertSuccess :message="message" />
        <AlertError :message="error" />
        <AdminDetailSkeleton v-if="! user && ! error" />
        <div v-if="user" :class="[fbCard, 'space-y-0 overflow-hidden p-0',]">
            <AdminUserSteps :model-value="tab" :items="steps" @update:model-value="tab = $event" />
            <div v-if="tab === 'profile'" class="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                <div class="sm:col-span-2">
                    <p class="mb-2 text-center text-sm font-medium">{{ t ("avatar") }}</p>
                    <div class="flex justify-center">
                        <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700">
                            <img v-if="user.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover">
                            <svg v-else class="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <p class="mb-2 text-center text-sm font-medium">{{ t ("full_name") }}</p>
                    <div :class="showValue">{{ resolveUserDisplayName (user) }}</div>
                </div>
                <div>
                    <p class="mb-2 text-center text-sm font-medium">{{ t ("email") }}</p>
                    <div :class="[showValue, 'break-all',]">{{ user.email }}</div>
                </div>
                <div class="sm:col-span-2">
                    <p class="mb-2 text-center text-sm font-medium">{{ t ("created_at") }}</p>
                    <div :class="showValue">{{ formatStamp (user.created_at) }}</div>
                </div>
            </div>
            <div v-else class="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                <div>
                    <p class="mb-2 text-center text-sm font-medium">{{ t ("role") }}</p>
                    <div :class="showValue">
                        <span v-if="user.role" class="badge-brand-primary inline-flex rounded px-2.5 py-0.5 text-xs font-medium">{{ roleLabel (user.role) }}</span>
                        <span v-else>-</span>
                    </div>
                </div>
                <div>
                    <p class="mb-2 text-center text-sm font-medium">{{ t ("status") }}</p>
                    <div :class="showValue">
                        <AdminStatusDot :tone="userStatusTone (resolveUserAccountStatus (user))">
                            {{ t (`status_${resolveUserAccountStatus (user)}`) }}
                        </AdminStatusDot>
                    </div>
                </div>
            </div>
            <div :class="[fbAdminShowBack, 'flex flex-wrap items-center justify-between gap-2 px-4 pb-4 sm:px-6 sm:pb-6',]">
                <FbButton variant="outline" to="/admin/users">{{ t ("back_to_users") }}</FbButton>
                <div class="flex flex-wrap gap-2">
                    <FbButton v-if="can ('user.update') && canChange" variant="outline" :to="`/admin/users/${route.params.id}/edit`">{{ t ("edit") }}</FbButton>
                    <FbButton
                        v-if="can ('user.update') && canChange && ! user.deleted_at && ! user.email_verified_at"
                        variant="secondary"
                        type="button"
                        @click="ask (t ('confirm_verify'), () => verify (String (route.params.id)))">
                        {{ t ("verify") }}
                    </FbButton>
                    <FbButton
                        v-if="can ('user.restore') && canChange && user.deleted_at"
                        variant="outline"
                        type="button"
                        @click="ask (t ('confirm_activate'), () => activate (String (route.params.id)))">
                        {{ t ("activate") }}
                    </FbButton>
                    <FbButton
                        v-else-if="can ('user.delete') && canChange && ! user.deleted_at"
                        variant="outline"
                        type="button"
                        @click="ask (t ('confirm_deactivate'), () => deactivate (String (route.params.id)), true)">
                        {{ t ("deactivate") }}
                    </FbButton>
                </div>
            </div>
        </div>
        <AdminConfirmModal
            :open="confirmOpen"
            title-id="user-show-confirm-title"
            :title="t ('confirm')"
            :message="confirmMessage"
            :confirm-label="t ('confirm')"
            :danger="confirmDanger"
            @update:open="confirmOpen = $event"
            @confirm="runConfirm" />
    </AdminFrame>
</template>
