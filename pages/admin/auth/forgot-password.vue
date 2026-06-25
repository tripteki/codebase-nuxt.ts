<script setup lang="ts">
import { reactive, ref, computed, } from "vue";
import {
    definePageMeta,
    navigateTo,
    useHead,
    useTranslation,
    useRoute,
} from "#imports";

import InputError from "@/components/InputError.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import TextLink from "@/components/TextLink.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import { parseApiErrors, } from "@/lib/parse-api-errors";
import type { ForgotPasswordProps } from "@/types/admin/auth";
import { useRequireGuest, } from "@/composables/useAuthGuard";
import { definePageGuest, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: false,
});

definePageGuest ();

const props = defineProps<ForgotPasswordProps>();

const { t, } = useTranslation ("auth");
const route = useRoute ();
const { canRender, } = useRequireGuest ();

useHead ({
    title: computed (() => t ("forgot_password")),
});

const data = reactive ({
    email: "",
});

const errors = ref<Record<string, string>>({});
const processing = ref (false);

const status = computed (
    () => props.status ?? (route.query.status as string | undefined)
);

async function submit (event: Event): Promise<void> {
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

    try {
        const response = await $fetch<{
            success?: boolean;
            data?: Record<string, unknown>;
            errors?: Record<string, string>;
            message?: string;
        }>("/api/auth/forgot-password", {
            method: "POST",
            body: data,
        });

        if (response?.errors) {
            errors.value = parseApiErrors (response, t ("something_went_wrong"));
        } else if (response?.data || response?.success) {
            await navigateTo ({
                path: "/admin/auth/login",
                query: { status: t ("password_reset_link_sent") },
            });
        } else if (response?.message) {
            errors.value = { email: response.message };
        } else {
            errors.value = { email: t ("something_went_wrong") };
        }
    } catch (error: any) {
        errors.value = parseApiErrors (error?.data, t ("something_went_wrong"));
    } finally {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        v-if="canRender"
        :title="t ('forgot_password_title')"
        :description="t ('forgot_password_description')">
        <AlertSuccess :message="status" />

        <div class="space-y-6">
            <form novalidate @submit.prevent="submit">
                <AlertError :message="errors.general" />

                <div class="grid gap-2">
                    <FbLabel html-for="email">{{ t ("email_address") }}</FbLabel>
                    <FbInput
                        id="email"
                        v-model="data.email"
                        type="email"
                        name="email"
                        autocomplete="off"
                        autofocus
                        :placeholder="t ('email_placeholder')"
                        :invalid="!! errors.email" />
                    <InputError :message="errors.email" />
                </div>

                <div class="my-6 flex items-center justify-start">
                    <FbButton
                        type="submit"
                        class="w-full"
                        :disabled="processing"
                        data-test="email-password-reset-link-button">
                        <FbSpinner v-if="processing" />
                        {{
                            processing
                                ? t ("sending")
                                : t ("email_password_reset_link")
                        }}
                    </FbButton>
                </div>
            </form>

            <div class="space-x-1 text-center text-sm text-gray-500 dark:text-gray-400">
                <span>{{ t ("or_return_to") }}</span>
                <TextLink to="/admin/auth/login">
                    {{ t ("log_in_lower") }}
                </TextLink>
            </div>
        </div>
    </AuthLayout>
</template>
