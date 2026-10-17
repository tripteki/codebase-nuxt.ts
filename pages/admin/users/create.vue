<script setup lang="ts">
import { computed, reactive, ref, } from "vue";
import { navigateTo, useTranslation, } from "#imports";

import AdminFilePicker from "@/components/admin/AdminFilePicker.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AdminUserSteps from "@/components/admin/AdminUserSteps.vue";
import AlertError from "@/components/AlertError.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import InputError from "@/components/InputError.vue";
import { useAdminUsers, } from "@/composables/useAdminUsers";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { fbCard, fbInput, } from "@/lib/flowbite-classes";
import { assignableAdminRoles, createDefaultUserForm, validateAdminUserForm, } from "@/types/admin/user";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { create, } = useAdminUsers ();
const { isSuperadmin, } = useAdminAccesses ();
const form = reactive (createDefaultUserForm ());
const avatar = ref<File | null> (null);
const avatarPreview = ref ("");
const error = ref ("");
const fieldErrors = ref<Partial<Record<"full_name" | "email" | "password" | "password_confirmation", string>>> ({});
const step = ref<"profile" | "access"> ("profile");
const steps = computed (() => [
    { key: "profile", label: t ("users_tab_profile"), },
    { key: "access", label: t ("users_tab_access"), },
]);

function roleLabel (key: string): string {
    const translated = t (`role_${key}`);

    if (translated === `role_${key}` || translated.endsWith (`.role_${key}`)) {
        return key;
    }

    return translated;
}

function messages () {
    return {
        emailInvalid: t ("email_invalid"),
        passwordMin: t ("password_min"),
        passwordMismatch: t ("password_mismatch"),
        fullNameRequired: t ("full_name_required"),
    };
}

function goAccess (): void {
    fieldErrors.value = validateAdminUserForm (form, "create", messages ());

    if (Object.keys (fieldErrors.value).length > 0) {
        return;
    }

    step.value = "access";
}

function onStep (next: string): void {
    if (next === "access") {
        goAccess ();

        return;
    }

    step.value = "profile";
}

function onAvatar (file: File | null): void {
    avatar.value = file;

    if (avatarPreview.value) {
        URL.revokeObjectURL (avatarPreview.value);
    }

    avatarPreview.value = file ? URL.createObjectURL (file) : "";
}

async function submit (): Promise<void> {
    error.value = "";
    fieldErrors.value = validateAdminUserForm (form, "create", messages ());

    if (Object.keys (fieldErrors.value).length > 0) {
        step.value = "profile";

        return;
    }

    if (! form.name.trim ()) {
        form.name = form.full_name.trim ();
    }

    const result = await create (form, avatar.value);

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    await navigateTo ("/admin/users");
}
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('users_create')" :description="t ('users_create_description')">
        <AlertError :message="error" />
        <form :class="[fbCard, 'max-w-3xl space-y-0 overflow-hidden p-0',]" method="post" @submit.prevent="submit">
            <AdminUserSteps :model-value="step" :items="steps" @update:model-value="onStep" />
            <div v-show="step === 'profile'" class="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                <div class="sm:col-span-2">
                    <FbLabel class="text-center" html-for="user-create-avatar">{{ t ("avatar") }}</FbLabel>
                    <div class="flex flex-col items-center gap-4">
                        <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700">
                            <img v-if="avatarPreview" :src="avatarPreview" alt="" class="h-full w-full object-cover">
                            <svg v-else class="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <AdminFilePicker id="user-create-avatar" class="w-full max-w-xs" accept="image/*" :model-value="avatar" @update:model-value="onAvatar" />
                    </div>
                </div>
                <div>
                    <FbLabel class="text-center" html-for="user-create-full-name">{{ t ("full_name") }}</FbLabel>
                    <FbInput id="user-create-full-name" v-model="form.full_name" name="full_name" icon="none" required :placeholder="t ('full_name_placeholder')" :invalid="!! fieldErrors.full_name" />
                    <InputError :message="fieldErrors.full_name" />
                </div>
                <div>
                    <FbLabel class="text-center" html-for="user-create-email">{{ t ("email") }}</FbLabel>
                    <FbInput id="user-create-email" v-model="form.email" type="email" name="email" required :placeholder="t ('email_placeholder')" :invalid="!! fieldErrors.email" />
                    <InputError :message="fieldErrors.email" />
                </div>
                <div>
                    <FbLabel html-for="user-create-password">{{ t ("password") }}</FbLabel>
                    <FbInput id="user-create-password" v-model="form.password" type="password" name="password" required :placeholder="t ('password_placeholder')" :invalid="!! fieldErrors.password" />
                    <InputError :message="fieldErrors.password" />
                </div>
                <div>
                    <FbLabel html-for="user-create-password-confirmation">{{ t ("confirm_password") }}</FbLabel>
                    <FbInput id="user-create-password-confirmation" v-model="form.password_confirmation" type="password" name="password_confirmation" required :placeholder="t ('password_confirmation_placeholder')" :invalid="!! fieldErrors.password_confirmation" />
                    <InputError :message="fieldErrors.password_confirmation" />
                </div>
            </div>
            <div v-show="step === 'access'" class="grid gap-4 p-4 sm:p-6">
                <div>
                    <FbLabel html-for="user-create-role">{{ t ("role") }}</FbLabel>
                    <select id="user-create-role" v-model="form.role" :class="fbInput">
                        <option value="" disabled>{{ t ("users_role_placeholder") }}</option>
                        <option v-for="role in assignableAdminRoles (isSuperadmin)" :key="role" :value="role">{{ roleLabel (role) }}</option>
                    </select>
                </div>
            </div>
            <div class="flex flex-wrap justify-end gap-2 border-t border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-700">
                <FbButton v-if="step === 'profile'" variant="outline" to="/admin/users">{{ t ("cancel") }}</FbButton>
                <FbButton v-if="step === 'profile'" type="button" @click="goAccess">{{ t ("next") }}</FbButton>
                <FbButton v-if="step === 'access'" variant="outline" type="button" @click="step = 'profile'">{{ t ("back") }}</FbButton>
                <FbButton v-if="step === 'access'" type="submit">{{ t ("users_create") }}</FbButton>
            </div>
        </form>
    </AdminFrame>
</template>
