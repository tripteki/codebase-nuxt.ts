<script setup lang="ts">
import { ref, computed, onMounted, } from "vue";
import {
    definePageMeta,
    navigateTo,
    useHead,
    useTranslation,
    useRoute,
} from "#imports";

import { shouldRedirectVerifyEmailError, } from "@/lib/api-error-matchers";
import AuthLayout from "@/components/AuthLayout.vue";
import TextLink from "@/components/TextLink.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import { fbAlertSuccess, fbMuted, } from "@/lib/flowbite-classes";
import { definePagePublic, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: false,
    middleware: ["auth-verify-email"],
});

definePagePublic ();

const { t, } = useTranslation ("auth");
const route = useRoute ();

const email = computed (() => String (route.params.email ?? ""));
const signed = computed (() => String (route.query.signed ?? ""));

useHead ({
    title: computed (() => t ("verify_email")),
});

const status = ref<"verifying" | "success" | "error">("verifying");
const message = ref ("");

onMounted (async (): Promise<void> => {
    try {
        const response = await $fetch<{
            success?: boolean;
            message?: string;
            errors?: Record<string, string>;
        }>("/api/auth/verify-email", {
            method: "POST",
            body: {
                email: email.value,
                signed: signed.value,
            },
        });

        const getErrorMessage = (): string | null => {
            if (response?.errors?.general) {
                return response.errors.general;
            }

            if (response?.message && ! response.success) {
                return response.message;
            }

            return null;
        };

        const errorMessage = getErrorMessage ();
        const shouldRedirect =
            errorMessage && shouldRedirectVerifyEmailError (errorMessage);

        if (shouldRedirect) {
            await navigateTo ("/");
            return;
        }

        if (errorMessage) {
            status.value = "error";
            message.value = errorMessage;
        } else if (response?.success) {
            status.value = "success";
            message.value = response.message || t ("email_verified");
        } else {
            status.value = "error";
            message.value = t ("verification_failed");
        }
    } catch (error: any) {
        const errorMessage =
            error?.data?.message ??
            error?.data?.errors?.general ??
            t ("verification_failed");

        if (shouldRedirectVerifyEmailError (errorMessage)) {
            await navigateTo ("/");
            return;
        }

        status.value = "error";
        message.value = errorMessage;
    }
});
</script>

<template>
    <AuthLayout
        :title="t ('verify_email_title')"
        :description="t ('verify_email_description')">
        <div class="space-y-6">
            <div
                v-if="status === 'verifying'"
                class="flex flex-col items-center gap-4">
                <FbSpinner class="h-8 w-8" />
                <p :class="['text-center', fbMuted]">
                    {{ t ("verifying_email") }}
                </p>
            </div>

            <div v-else-if="status === 'success'" class="space-y-4">
                <div :class="[fbAlertSuccess, 'text-center']">
                    <p class="font-medium">
                        {{ message }}
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <FbButton
                        class="w-full"
                        to="/admin/auth/login">
                        {{ t ("log_in") }}
                    </FbButton>

                    <TextLink to="/" class="text-center text-sm">
                        {{ t ("go_to_home") }}
                    </TextLink>
                </div>
            </div>

            <div v-else class="space-y-4">
                <div
                    class="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
                    <p
                        class="text-sm font-medium text-red-800 dark:text-red-200">
                        {{ message }}
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <FbButton
                        variant="outline"
                        class="w-full"
                        to="/admin/auth/login">
                        {{ t ("go_to_login") }}
                    </FbButton>

                    <TextLink
                        to="/admin/auth/register"
                        class="text-center text-sm">
                        {{ t ("sign_up") }}
                    </TextLink>
                </div>
            </div>
        </div>
    </AuthLayout>
</template>
