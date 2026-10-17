<script setup lang="ts">
import { computed, onMounted, reactive, ref, } from "vue";
import { navigateTo, useRoute, useTranslation, } from "#imports";

import AdminFormSkeleton from "@/components/admin/AdminFormSkeleton.vue";
import AdminUserSteps from "@/components/admin/AdminUserSteps.vue";
import AdminFilePicker from "@/components/admin/AdminFilePicker.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import InputError from "@/components/InputError.vue";
import { useAdminUsers, } from "@/composables/useAdminUsers";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { fbCard, fbInput, fbMuted, } from "@/lib/flowbite-classes";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { resolveSessionUserId, } from "@/lib/session-user";
import {
    assignableAdminRoles,
    createDefaultUserForm,
    userToFormPayload,
    validateAdminUserForm,
    type AdminUser,
} from "@/types/admin/user";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { data: sessionData, } = useAuth ();
const { get, update, } = useAdminUsers ();
const { isSuperadmin, } = useAdminAccesses ();
const form = reactive (createDefaultUserForm ());
const tab = ref ("profile");
const steps = computed (() => [
    { key: "profile", label: t ("users_tab_profile"), },
    { key: "access", label: t ("users_tab_access"), },
]);
const avatar = ref<File | null> (null);
const avatarUrl = ref ("");
const avatarPreview = ref ("");
const error = ref ("");
const ready = ref (false);
const fieldErrors = ref<Partial<Record<"full_name" | "email" | "password" | "password_confirmation", string>>> ({});
const roleLocked = computed (() => String (route.params.id) === resolveSessionUserId (sessionData.value));

function roleLabel (key: string): string {
    const translated = t (`role_${key}`);

    if (translated === `role_${key}` || translated.endsWith (`.role_${key}`)) {
        return key;
    }

    return translated;
}

function onAvatar (file: File | null): void {
    avatar.value = file;

    if (avatarPreview.value) {
        URL.revokeObjectURL (avatarPreview.value);
    }

    avatarPreview.value = file ? URL.createObjectURL (file) : "";
}

onMounted (async () => {
    const result = await get (String (route.params.id));

    if (result.isSuccess) {
        const user = result.data as AdminUser;

        Object.assign (form, userToFormPayload (user));
        avatarUrl.value = user.avatar_url || "";
    }

    ready.value = true;
});

async function submit (): Promise<void> {
    error.value = "";
    fieldErrors.value = validateAdminUserForm (form, "edit", {
        emailInvalid: t ("email_invalid"),
        passwordMin: t ("password_min"),
        passwordMismatch: t ("password_mismatch"),
        fullNameRequired: t ("full_name_required"),
    });

    if (Object.keys (fieldErrors.value).length > 0) {
        return;
    }

    if (! form.name.trim ()) {
        form.name = form.full_name.trim ();
    }

    const result = await update (String (route.params.id), form, avatar.value);

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    await navigateTo (`/admin/users/${route.params.id}`);
}
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('users_edit')" :description="t ('users_edit_description')">
        <AlertError :message="error" />
        <AdminFormSkeleton v-if="! ready" :fields="6" />
        <form v-else :class="[fbCard, 'max-w-3xl space-y-0 overflow-hidden p-0',]" method="post" @submit.prevent="submit">
            <AdminUserSteps :model-value="tab" :items="steps" @update:model-value="tab = $event" />
            <div v-if="tab === 'profile'" class="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                <div class="sm:col-span-2">
                    <FbLabel class="text-center" html-for="user-edit-avatar">{{ t ("avatar") }}</FbLabel>
                    <div class="flex flex-col items-center gap-4">
                        <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700">
                            <img v-if="avatarPreview || avatarUrl" :src="avatarPreview || avatarUrl" alt="" class="h-full w-full object-cover">
                            <svg v-else class="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <AdminFilePicker id="user-edit-avatar" class="w-full max-w-xs" accept="image/*" :model-value="avatar" @update:model-value="onAvatar" />
                    </div>
                </div>
                <div>
                    <FbLabel class="text-center" html-for="user-edit-full-name">{{ t ("full_name") }}</FbLabel>
                    <FbInput id="user-edit-full-name" v-model="form.full_name" name="full_name" icon="none" required :placeholder="t ('full_name_placeholder')" :invalid="!! fieldErrors.full_name" />
                    <InputError :message="fieldErrors.full_name" />
                </div>
                <div>
                    <FbLabel class="text-center" html-for="user-edit-email">{{ t ("email") }}</FbLabel>
                    <FbInput id="user-edit-email" v-model="form.email" type="email" name="email" required :placeholder="t ('email_placeholder')" :invalid="!! fieldErrors.email" />
                    <InputError :message="fieldErrors.email" />
                </div>
                <div>
                    <FbLabel html-for="user-edit-password">{{ t ("new_password") }}</FbLabel>
                    <FbInput id="user-edit-password" v-model="form.password" type="password" name="password" :placeholder="t ('new_password_placeholder')" :invalid="!! fieldErrors.password" />
                    <InputError :message="fieldErrors.password" />
                </div>
                <div>
                    <FbLabel html-for="user-edit-password-confirmation">{{ t ("confirm_password") }}</FbLabel>
                    <FbInput id="user-edit-password-confirmation" v-model="form.password_confirmation" type="password" name="password_confirmation" :placeholder="t ('new_password_confirmation_placeholder')" :invalid="!! fieldErrors.password_confirmation" />
                    <InputError :message="fieldErrors.password_confirmation" />
                </div>
            </div>
            <div v-if="tab === 'access'" class="grid gap-4 p-4 sm:p-6">
                <div>
                    <FbLabel html-for="user-edit-role">{{ t ("role") }}</FbLabel>
                    <select id="user-edit-role" v-model="form.role" :class="fbInput" :disabled="roleLocked">
                        <option value="" disabled>{{ t ("users_role_placeholder") }}</option>
                        <option v-for="role in assignableAdminRoles (isSuperadmin)" :key="role" :value="role">{{ roleLabel (role) }}</option>
                    </select>
                    <p v-if="roleLocked" :class="fbMuted" class="mt-1 text-xs">{{ t ("role_locked_self") }}</p>
                </div>
            </div>
            <div class="flex flex-wrap justify-end gap-2 border-t border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-700">
                <FbButton variant="outline" :to="`/admin/users/${route.params.id}`">{{ t ("cancel") }}</FbButton>
                <FbButton type="submit">{{ t ("save_changes") }}</FbButton>
            </div>
        </form>
    </AdminFrame>
</template>
