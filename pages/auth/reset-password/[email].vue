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
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Spinner, } from "@/components/ui/spinner";

definePageMeta ({
    layout: false,
    middleware: [ "auth-reset-email", ],
});

const { t, } = useTranslation ("auth");
const { call, } = useCall ();
const config = useRuntimeConfig ();
const route = useRoute ();

const email = computed (() => String (route.params.email ?? ""));
const signed = computed (() => route.query.signed as string | undefined);

useHead ({
    title: computed (() => t ("reset_password")),
});

const data = reactive ({
    password: "",
    password_confirmation: "",
});

const errors = ref<Record<string, string>> ({});
const processing = ref (false);

async function submit (event: Event): Promise<void>
{
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

    const params: Record<string, string> = {};

    if (signed.value)
    {
        params.signed = signed.value;
    }

    try
    {
        const response = await call ({
            baseUrl: String (config.public.authURL),
            url: `/reset-password/${email.value}`,
            method: "POST",
            data: {
                password: data.password,
                password_confirmation: data.password_confirmation,
            },
            params,
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
                    errors.value = { password: axiosError.response.data.message, };
                }
                else if (typeof axiosError.response.data === "string")
                {
                    errors.value = { password: axiosError.response.data, };
                }
                else
                {
                    errors.value = { password: t ("something_went_wrong"), };
                }
            }
            else
            {
                errors.value = { password: t ("something_went_wrong"), };
            }
        }
        else if (response.isSuccess)
        {
            if (typeof response.data === "string")
            {
                errors.value = { password: response.data, };
            }
            else if (response.data?.errors)
            {
                errors.value = response.data.errors;
            }
            else if (response.data && typeof response.data === "object")
            {
                await navigateTo ({
                    path: "/admin/auth/login",
                    query: { status: t ("password_reset"), },
                });
            }
            else
            {
                errors.value = { password: t ("something_went_wrong"), };
            }
        }
    }
    catch
    {
        errors.value = { password: t ("something_went_wrong"), };
    }
    finally
    {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        :title="t('reset_password_title')"
        :description="t('reset_password_description')"
    >
        <form @submit="submit">
        <div class="grid gap-6">
            <div class="grid gap-2">
                <Label html-for="email">{{ t("email") }}</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    :model-value="email"
                    class="mt-1 block w-full"
                    readonly
                />
                <InputError :message="errors.email" />
            </div>

            <div class="grid gap-2">
                <Label html-for="password">{{ t("password") }}</Label>
                <Input
                    id="password"
                    v-model="data.password"
                    type="password"
                    name="password"
                    autocomplete="new-password"
                    class="mt-1 block w-full"
                    autofocus
                    :placeholder="t('password_placeholder')"
                />
                <InputError :message="errors.password" />
            </div>

            <div class="grid gap-2">
                <Label html-for="password_confirmation">
                    {{ t("password_confirmation_label") }}
                </Label>
                <Input
                    id="password_confirmation"
                    v-model="data.password_confirmation"
                    type="password"
                    name="password_confirmation"
                    autocomplete="new-password"
                    class="mt-1 block w-full"
                    :placeholder="t('password_confirmation_placeholder')"
                />
                <InputError :message="errors.password_confirmation" />
            </div>

            <Button
                type="submit"
                class="mt-4 w-full"
                :disabled="processing"
                data-test="reset-password-button"
            >
                <Spinner
                    v-if="processing"
                    class="mx-5"
                />
                {{ processing ? t("resetting") : t("reset_password") }}
            </Button>
        </div>
    </form>
    </AuthLayout>
</template>
