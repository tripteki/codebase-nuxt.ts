<script setup lang="ts">
import { ref, computed, onMounted, } from "vue";
import {
    definePageMeta,
    navigateTo,
    useCall,
    useHead,
    useTranslation,
    useRoute,
    useRuntimeConfig,
} from "#imports";

import { shouldRedirectVerifyEmailError, } from "@/lib/api-error-matchers";
import AuthLayout from "@/components/AuthLayout.vue";
import TextLink from "@/components/TextLink.vue";
import { Button, } from "@/components/ui/button";
import { Spinner, } from "@/components/ui/spinner";

definePageMeta ({
    layout: false,
    middleware: [ "auth-verify-email", ],
});

const { t, } = useTranslation ("auth");
const { call, } = useCall ();
const config = useRuntimeConfig ();
const route = useRoute ();

const email = computed (() => String (route.params.email ?? ""));
const signed = computed (() => String (route.query.signed ?? ""));

useHead ({
    title: computed (() => t ("verify_email")),
});

const status = ref<"verifying" | "success" | "error"> ("verifying");
const message = ref ("");

onMounted (async (): Promise<void> =>
{
    try
    {
        const response = await call ({
            baseUrl: String (config.public.authURL),
            url: `/verify-email/${email.value}`,
            method: "POST",
            data: {},
            params: {
                signed: signed.value,
            },
        });

        const getErrorMessage = (): string | null =>
        {
            if (response.isError)
            {
                const axiosError = response.error as any;

                if (axiosError?.response?.data?.message)
                {
                    return axiosError.response.data.message;
                }

                if (axiosError?.response?.data?.errors?.general)
                {
                    return axiosError.response.data.errors.general;
                }

                if (typeof axiosError?.response?.data === "string")
                {
                    return axiosError.response.data;
                }

                return t ("verification_failed");
            }

            if (response.isSuccess)
            {
                if (typeof response.data === "string")
                {
                    return response.data;
                }

                if (response.data?.errors?.general)
                {
                    return response.data.errors.general;
                }

                if (response.data?.errors && response.data?.message)
                {
                    return response.data.message;
                }
            }

            return null;
        };

        const errorMessage = getErrorMessage ();
        const shouldRedirect = errorMessage && shouldRedirectVerifyEmailError (errorMessage);

        if (shouldRedirect)
        {
            await navigateTo ("/");
            return;
        }

        if (errorMessage)
        {
            status.value = "error";
            message.value = errorMessage;
        }
        else if (response.isSuccess && response.data && typeof response.data === "object" && ! response.data.errors)
        {
            status.value = "success";
            message.value = response.data.message || t ("email_verified");
        }
        else
        {
            status.value = "error";
            message.value = t ("verification_failed");
        }
    }
    catch
    {
        status.value = "error";
        message.value = t ("verification_failed");
    }
});
</script>

<template>
    <AuthLayout
        :title="t('verify_email_title')"
        :description="t('verify_email_description')"
    >
        <div class="space-y-6">
        <div
            v-if="status === 'verifying'"
            class="flex flex-col items-center gap-4"
        >
            <Spinner class="h-8 w-8" />
            <p class="text-center text-sm text-muted-foreground">
                {{ t("verifying_email") }}
            </p>
        </div>

        <div
            v-else-if="status === 'success'"
            class="space-y-4"
        >
            <div class="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
                <p class="text-sm font-medium text-green-800 dark:text-green-200">
                    {{ message }}
                </p>
            </div>

            <div class="flex flex-col gap-2">
                <Button
                    class="w-full"
                    @click="navigateTo('/admin/auth/login')"
                >
                    {{ t("log_in") }}
                </Button>

                <TextLink
                    to="/"
                    class="text-center text-sm"
                >
                    {{ t("go_to_home") }}
                </TextLink>
            </div>
        </div>

        <div
            v-else
            class="space-y-4"
        >
            <div class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
                <p class="text-sm font-medium text-red-800 dark:text-red-200">
                    {{ message }}
                </p>
            </div>

            <div class="flex flex-col gap-2">
                <Button
                    variant="outline"
                    class="w-full"
                    @click="navigateTo('/admin/auth/login')"
                >
                    {{ t("go_to_login") }}
                </Button>

                <TextLink
                    to="/admin/auth/register"
                    class="text-center text-sm"
                >
                    {{ t("sign_up") }}
                </TextLink>
            </div>
        </div>
    </div>
    </AuthLayout>
</template>
