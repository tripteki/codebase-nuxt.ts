<script setup lang="ts">
import { reactive, ref, computed, } from "vue";
import {
    definePageMeta,
    navigateTo,
    useCall,
    useHead,
    useTranslation,
    useRoute,
    useRuntimeConfig,
} from "#imports";

import InputError from "@/components/InputError.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import TextLink from "@/components/TextLink.vue";
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { LoaderCircle, } from "@/components/ui/loader-circle";
import type { ForgotPasswordProps, } from "@/types/admin/auth";

definePageMeta ({
    layout: false,
});

const props = defineProps<ForgotPasswordProps> ();

const { t, } = useTranslation ("auth");
const { call, } = useCall ();
const config = useRuntimeConfig ();
const route = useRoute ();

useHead ({
    title: computed (() => t ("forgot_password")),
});

const data = reactive ({
    email: "",
});

const errors = ref<Record<string, string>> ({});
const processing = ref (false);

const status = computed (() => props.status ?? (route.query.status as string | undefined));

async function submit (event: Event): Promise<void>
{
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

    try
    {
        const response = await call ({
            baseUrl: String (config.public.authURL),
            url: "/forgot-password",
            method: "POST",
            data,
        });

        if (response.isError)
        {
            const axiosError = response.error as any;

            if (axiosError?.response?.data)
            {
                if (axiosError.response.data.errors)
                {
                    errors.value = axiosError.response.data.errors;
                }
                else if (axiosError.response.data.message)
                {
                    errors.value = { email: axiosError.response.data.message, };
                }
                else if (typeof axiosError.response.data === "string")
                {
                    errors.value = { email: axiosError.response.data, };
                }
                else
                {
                    errors.value = { email: t ("something_went_wrong"), };
                }
            }
            else
            {
                errors.value = { email: t ("something_went_wrong"), };
            }
        }
        else if (response.isSuccess)
        {
            if (typeof response.data === "string")
            {
                errors.value = { email: response.data, };
            }
            else if (response.data?.errors)
            {
                errors.value = response.data.errors;
            }
            else if (response.data && typeof response.data === "object")
            {
                await navigateTo ({
                    path: "/admin/auth/login",
                    query: { status: t ("password_reset_link_sent"), },
                });
            }
            else
            {
                errors.value = { email: t ("something_went_wrong"), };
            }
        }
    }
    catch
    {
        errors.value = { email: t ("something_went_wrong"), };
    }
    finally
    {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        :title="t('forgot_password_title')"
        :description="t('forgot_password_description')"
    >
        <div
            v-if="status"
            class="mb-4 text-center text-sm font-medium text-green-600"
        >
            {{ status }}
        </div>

        <div class="space-y-6">
        <form @submit="submit">
            <div class="grid gap-2">
                <Label html-for="email">{{ t("email_address") }}</Label>
                <Input
                    id="email"
                    v-model="data.email"
                    type="email"
                    name="email"
                    autocomplete="off"
                    autofocus
                    :placeholder="t('email_placeholder')"
                />
                <InputError :message="errors.email" />
            </div>

            <div class="my-6 flex items-center justify-start">
                <Button
                    type="submit"
                    class="w-full"
                    :disabled="processing"
                    data-test="email-password-reset-link-button"
                >
                    <LoaderCircle v-if="processing" />
                    {{ processing ? t("sending") : t("email_password_reset_link") }}
                </Button>
            </div>
        </form>

        <div class="space-x-1 text-center text-sm text-muted-foreground">
            <span>{{ t("or_return_to") }}</span>
            <TextLink to="/admin/auth/login">
                {{ t("log_in_lower") }}
            </TextLink>
        </div>
    </div>
    </AuthLayout>
</template>
