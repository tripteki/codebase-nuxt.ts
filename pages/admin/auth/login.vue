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
import FbLabel from "@/components/flowbite/FbLabel.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import { fbMuted, } from "@/lib/flowbite-classes";
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

const status = computed (() => route.query.status as string | undefined);
const identifierError = computed (
    () => errors.value.email || errors.value.identifier
);
const passwordError = computed (() => errors.value.password);

async function submit (event: Event): Promise<void> {
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

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
    } finally {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        v-if="canRender"
        :title="t ('login_title')"
        :description="t ('login_description')">
        <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
            <AlertSuccess :message="status" />
            <AlertError :message="errors.general" />

            <div class="grid gap-6">
                <div class="grid gap-2">
                    <FbLabel html-for="email">{{ t ("email_address") }}</FbLabel>
                    <FbInput
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

                <div class="grid gap-2">
                    <div class="mb-2 flex items-center justify-between">
                        <FbLabel html-for="password" variant="inline">{{ t ("password") }}</FbLabel>
                        <TextLink
                            v-if="props.canResetPassword"
                            to="/admin/auth/forgot-password"
                            class="ml-auto text-sm"
                            tabindex="5">
                            {{ t ("forgot_password_link") }}
                        </TextLink>
                    </div>
                    <FbInput
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

                <FbCheckboxField
                    id="remember"
                    v-model="data.remember"
                    name="remember"
                    tabindex="3">
                    {{ t ("remember_me") }}
                </FbCheckboxField>

                <FbButton
                    type="submit"
                    class="mt-4 w-full"
                    tabindex="4"
                    :disabled="processing"
                    data-test="login-button">
                    <FbSpinner v-if="processing" />
                    {{ processing ? t ("logging_in") : t ("log_in") }}
                </FbButton>
            </div>

            <div
                v-if="props.canRegister"
                class="text-center text-sm text-gray-500 dark:text-gray-400">
                {{ t ("dont_have_account") }}{{ " " }}
                <TextLink to="/admin/auth/register" tabindex="5">
                    {{ t ("sign_up") }}
                </TextLink>
            </div>
        </form>
    </AuthLayout>
</template>
