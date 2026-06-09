<script setup lang="ts">
import { reactive, ref, computed, } from "vue";
import {
    definePageMeta,
    navigateTo,
    useCall,
    useHead,
    useTranslation,
    useRuntimeConfig,
} from "#imports";

import AlertError from "@/components/AlertError.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import InputError from "@/components/InputError.vue";
import TextLink from "@/components/TextLink.vue";
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Spinner, } from "@/components/ui/spinner";
import { parseApiErrors, } from "@/lib/parse-api-errors";
import { cn, } from "@/lib/utils";

definePageMeta ({
    layout: false,
});

const { t, } = useTranslation ("auth");
const { call, } = useCall ();
const config = useRuntimeConfig ();

useHead ({
    title: computed (() => t ("register")),
});

const data = reactive ({
    name: "",
    email: "",
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

    try
    {
        const response = await call ({
            baseUrl: String (config.public.authURL),
            url: "/register",
            method: "POST",
            data,
        });

        if (response.isError)
        {
            const axiosError = response.error as any;

            errors.value = parseApiErrors (
                axiosError?.response?.data,
                t ("registration_failed")
            );
        }
        else if (response.isSuccess)
        {
            if (typeof response.data === "string")
            {
                errors.value = { general: response.data, };
            }
            else if (response.data?.errors)
            {
                errors.value = parseApiErrors (response.data.errors, t ("registration_failed"));
            }
            else if (response.data && typeof response.data === "object")
            {
                await navigateTo ({
                    path: "/admin/auth/login",
                    query: { status: t ("verification-sent"), },
                });
            }
            else
            {
                errors.value = { general: t ("registration_failed"), };
            }
        }
    }
    catch
    {
        errors.value = { general: t ("registration_failed"), };
    }
    finally
    {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        :title="t('register_title')"
        :description="t('register_description')"
    >
        <form
            class="flex flex-col gap-6"
            @submit="submit"
        >
        <AlertError :message="errors.general" />

        <div class="grid gap-6">
            <div class="grid gap-2">
                <Label html-for="name">{{ t("name") }}</Label>
                <Input
                    id="name"
                    v-model="data.name"
                    type="text"
                    name="name"
                    required
                    autofocus
                    tabindex="1"
                    autocomplete="name"
                    :placeholder="t('username')"
                    :aria-invalid="!! errors.name"
                    :class="cn(errors.name && 'border-destructive focus-visible:ring-destructive/30')"
                />
                <InputError :message="errors.name" />
            </div>

            <div class="grid gap-2">
                <Label html-for="email">{{ t("email_address") }}</Label>
                <Input
                    id="email"
                    v-model="data.email"
                    type="email"
                    name="email"
                    required
                    tabindex="2"
                    autocomplete="email"
                    :placeholder="t('email_placeholder')"
                    :aria-invalid="!! errors.email"
                    :class="cn(errors.email && 'border-destructive focus-visible:ring-destructive/30')"
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
                    required
                    tabindex="3"
                    autocomplete="new-password"
                    :placeholder="t('password_placeholder')"
                    :aria-invalid="!! errors.password"
                    :class="cn(errors.password && 'border-destructive focus-visible:ring-destructive/30')"
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
                    required
                    tabindex="4"
                    autocomplete="new-password"
                    :placeholder="t('password_confirmation_placeholder')"
                    :aria-invalid="!! errors.password_confirmation"
                    :class="cn(errors.password_confirmation && 'border-destructive focus-visible:ring-destructive/30')"
                />
                <InputError :message="errors.password_confirmation" />
            </div>

            <Button
                type="submit"
                class="mt-2 w-full"
                tabindex="5"
                :disabled="processing"
                data-test="register-user-button"
            >
                <Spinner
                    v-if="processing"
                    class="mx-5"
                />
                {{ processing ? t("registering") : t("create_account") }}
            </Button>
        </div>

        <div class="text-center text-sm text-muted-foreground">
            {{ t("already_have_account") }}{{ " " }}
            <TextLink
                to="/admin/auth/login"
                tabindex="6"
            >
                {{ t("log_in") }}
            </TextLink>
        </div>
    </form>
    </AuthLayout>
</template>
