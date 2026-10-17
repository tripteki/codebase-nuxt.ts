<script setup lang="ts">
import { reactive, ref, computed, } from "vue";
import {
    definePageMeta,
    navigateTo,
    useAuth,
    useHead,
    useTranslation,
    useRoute,
} from "#imports";

import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import InputError from "@/components/InputError.vue";
import TextLink from "@/components/TextLink.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbCheckboxField from "@/components/flowbite/FbCheckboxField.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import { parseApiErrors, type ApiErrorPayload, } from "@/lib/parse-api-errors";
import type { LoginProps } from "@/types/admin/auth";
import { useRequireGuest, } from "@/composables/useAuthGuard";
import { definePageGuest, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: false,
});

definePageGuest ();

const props = withDefaults (defineProps<LoginProps>(), {
    canResetPassword: true,
    canRegister: true,
});

const { t, } = useTranslation ("auth");
const route = useRoute ();
const { signIn, } = useAuth ();
const { canRender, } = useRequireGuest ();

useHead ({
    title: computed (() => t ("login")),
});

const data = reactive ({
    identifier: "",
    password: "",
    remember: false,
});

const errors = ref<Record<string, string>>({});
const processing = ref (false);
const needsVerification = ref (false);
const resending = ref (false);
const resendSuccess = ref ("");

const status = computed (() => route.query.status as string | undefined);
const identifierError = computed (
    () => errors.value.email || errors.value.identifier || errors.value.identifierValue
);
const passwordError = computed (() => errors.value.password);

async function submit (event: Event): Promise<void> {
    event.preventDefault ();

    if (! data.identifier.trim () || ! data.password) {
        errors.value = {
            ...(! data.identifier.trim () ? { identifier: t ("email_required"), } : {}),
            ...(! data.password ? { password: t ("password_required"), } : {}),
        };

        return;
    }

    processing.value = true;
    errors.value = {};
    needsVerification.value = false;
    resendSuccess.value = "";

    try {
        const response = await signIn (
            {
                identifier: data.identifier,
                password: data.password,
                remember: data.remember,
            },
            {
                redirect: false,
                callGetSession: true,
            }
        );

        if (! response) {
            errors.value = { general: t ("authentication_failed") };

            return;
        }

        const redirect = route.query.redirect as string | undefined;

        await navigateTo (
            redirect?.startsWith ("/") && ! redirect.startsWith ("//")
                ? redirect
                : "/admin/dashboard"
        );
    } catch (throwable: unknown) {
        errors.value = parseApiErrors (
            (throwable as { data?: ApiErrorPayload })?.data,
            t ("authentication_failed")
        );
        needsVerification.value = errors.value.code === "email_not_verified";
    } finally {
        processing.value = false;
    }
}

async function resendVerification (): Promise<void> {
    const email = data.identifier.trim ();

    if (! email.includes ("@") || resending.value) {
        return;
    }

    resending.value = true;
    resendSuccess.value = "";
    errors.value = {};

    try {
        const result = await $fetch<{ message?: string }> ("/api/auth/resend-verification", {
            method: "POST",
            body: { email, },
        });

        resendSuccess.value = result?.message || t ("verification-sent");
        needsVerification.value = false;
    } catch (throwable: unknown) {
        errors.value = parseApiErrors (
            (throwable as { data?: ApiErrorPayload })?.data,
            t ("something_went_wrong")
        );
    } finally {
        resending.value = false;
    }
}
</script>

<template>
    <AuthLayout
        v-if="canRender"
        variant="hero"
        title="">
        <form class="flex flex-col gap-4" method="post" novalidate @submit.prevent="submit">
            <AlertSuccess :message="status || resendSuccess" />
            <AlertError :message="errors.general" />
            <div v-if="needsVerification" class="auth-resend-box p-3 text-sm">
                <p>{{ t ("email_not_verified_message") }}</p>
                <FbButton
                    type="button"
                    variant="outline"
                    class="mt-3"
                    :disabled="resending || ! data.identifier.includes ('@')"
                    @click="resendVerification">
                    <FbSpinner v-if="resending" />
                    {{ resending ? t ("resending_verification_email") : t ("resend_verification_email") }}
                </FbButton>
            </div>

            <div class="grid gap-4">
                <div class="grid gap-1.5">
                    <FbInput
                        icon="none"
                        id="email"
                        v-model="data.identifier"
                        type="text"
                        name="identifier"
                        required
                        autofocus
                        tabindex="1"
                        autocomplete="username"
                        :placeholder="t ('email_placeholder')"
                        :invalid="!! identifierError" />
                    <InputError :message="identifierError" />
                </div>

                <div class="grid gap-1.5">
                    <FbInput
                        icon="none"
                        id="password"
                        v-model="data.password"
                        type="password"
                        name="password"
                        required
                        tabindex="2"
                        autocomplete="current-password"
                        :placeholder="t ('password_placeholder')"
                        :invalid="!! passwordError" />
                    <InputError :message="passwordError" />
                </div>

                <div class="flex flex-col gap-3 pt-2 sm:gap-4">
                    <div class="flex min-h-[1.25rem] items-center justify-between gap-4">
                        <FbCheckboxField
                            id="remember"
                            v-model="data.remember"
                            name="remember"
                            tabindex="3"
                            input-class="checkbox-auth-primary h-4 w-4 cursor-pointer rounded border-white/40 bg-white/10"
                            label-class="font-normal text-white/80">
                            {{ t ("remember_me") }}
                        </FbCheckboxField>
                        <TextLink
                            v-if="props.canResetPassword"
                            to="/auth/forgot-password"
                            class="ml-auto text-sm"
                            tabindex="5">
                            {{ t ("forgot_password_link") }}
                        </TextLink>
                    </div>
                    <FbButton
                        type="submit"
                        class="w-full"
                        tabindex="4"
                        :disabled="processing"
                        data-test="login-button">
                        <FbSpinner v-if="processing" />
                        {{ processing ? t ("logging_in") : t ("continue") }}
                    </FbButton>
                </div>
            </div>

            <p v-if="props.canRegister" class="text-center text-sm text-white/80">
                <TextLink to="/auth/register" class="underline" tabindex="5">
                    {{ t ("create_account") }}
                </TextLink>
            </p>
        </form>
    </AuthLayout>
</template>
