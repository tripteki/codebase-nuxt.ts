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
import AuthLayout from "@/components/AuthLayout.vue";
import InputError from "@/components/InputError.vue";
import TextLink from "@/components/TextLink.vue";
import { Button, } from "@/components/ui/button";
import { Checkbox, } from "@/components/ui/checkbox";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Spinner, } from "@/components/ui/spinner";
import { cn, } from "@/lib/utils";
import type { LoginProps, } from "@/types/admin/auth";

definePageMeta ({
    layout: false,
    middleware: "app-auth",
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/admin/dashboard",
    },
});

const props = withDefaults (defineProps<LoginProps> (), {
    canResetPassword: true,
    canRegister: true,
});

const { t, } = useTranslation ("auth");
const route = useRoute ();
const { getSession, } = useAuth ();
const { setToken, rawRefreshToken, } = useAuthState ();

useHead ({
    title: computed (() => t ("login")),
});

const data = reactive ({
    identifier: "",
    password: "",
    remember: false,
});

const errors = ref<Record<string, string>> ({});
const processing = ref (false);

const status = computed (() => route.query.status as string | undefined);
const identifierError = computed (() => errors.value.email || errors.value.identifier);
const passwordError = computed (() => errors.value.password);

async function submit (event: Event): Promise<void>
{
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

    try
    {
        const response = await $fetch<{
            accessToken: string;
            refreshToken?: string;
            jwt: string;
            user: Record<string, unknown>;
        }> ("/api/auth/login", {
            method: "POST",
            body: {
                identifier: data.identifier,
                password: data.password,
                remember: data.remember,
            },
        });

        setToken (response.accessToken);

        if (response.refreshToken)
        {
            rawRefreshToken.value = response.refreshToken;
        }

        await getSession ();
        await navigateTo ("/admin/dashboard");
    }
    catch (throwable: unknown)
    {
        const payload = (throwable as { data?: { errors?: Record<string, string> }; })?.data;

        if (payload?.errors)
        {
            errors.value = payload.errors;
        }
        else
        {
            errors.value = { general: t ("authentication_failed"), };
        }
    }
    finally
    {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        :title="t('login_title')"
        :description="t('login_description')"
    >
        <form
            class="flex flex-col gap-6"
            @submit="submit"
        >
            <AlertError :message="errors.general" />

            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label html-for="email">{{ t("email_address") }}</Label>
                    <Input
                        id="email"
                        v-model="data.identifier"
                        type="email"
                        name="identifier"
                        required
                        autofocus
                        tabindex="1"
                        autocomplete="email"
                        :placeholder="t('email_placeholder')"
                        :aria-invalid="!! identifierError"
                        :class="cn(identifierError && 'border-destructive focus-visible:ring-destructive/30')"
                    />
                    <InputError :message="identifierError" />
                </div>

                <div class="grid gap-2">
                    <div class="flex items-center">
                        <Label html-for="password">{{ t("password") }}</Label>
                        <TextLink
                            v-if="props.canResetPassword"
                            to="/admin/auth/forgot-password"
                            class="ml-auto text-sm"
                            tabindex="5"
                        >
                            {{ t("forgot_password_link") }}
                        </TextLink>
                    </div>
                    <Input
                        id="password"
                        v-model="data.password"
                        type="password"
                        name="password"
                        required
                        tabindex="2"
                        autocomplete="current-password"
                        :placeholder="t('password_placeholder')"
                        :aria-invalid="!! passwordError"
                        :class="cn(passwordError && 'border-destructive focus-visible:ring-destructive/30')"
                    />
                    <InputError :message="passwordError" />
                </div>

                <div class="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        v-model="data.remember"
                        name="remember"
                        tabindex="3"
                    />
                    <Label html-for="remember">{{ t("remember_me") }}</Label>
                </div>

                <Button
                    type="submit"
                    class="mt-4 w-full"
                    tabindex="4"
                    :disabled="processing"
                    data-test="login-button"
                >
                    <Spinner
                        v-if="processing"
                        class="mx-5"
                    />
                    {{ processing ? t("logging_in") : t("log_in") }}
                </Button>
            </div>

            <div
                v-if="props.canRegister"
                class="text-center text-sm text-muted-foreground"
            >
                {{ t("dont_have_account") }}{{ " " }}
                <TextLink
                    to="/admin/auth/register"
                    tabindex="5"
                >
                    {{ t("sign_up") }}
                </TextLink>
            </div>
        </form>

        <div
            v-if="status"
            class="mb-4 text-center text-sm font-medium text-green-600"
        >
            {{ status }}
        </div>
    </AuthLayout>
</template>
