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
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Spinner, } from "@/components/ui/spinner";

definePageMeta ({
    layout: false,
});

const route = useRoute ();

const email = computed (() => String (route.query.email ?? ""));
const token = computed (() => route.query.token as string | undefined);
const signed = computed (() => route.query.signed as string | undefined);

const { t, } = useTranslation ("auth");

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

    try
    {
        if (token.value)
        {
            await $fetch ("/api/auth/reset-password", {
                method: "POST",
                body: {
                    token: token.value,
                    email: email.value,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                },
            });
        }
        else
        {
            await $fetch ("/api/auth/reset-password", {
                method: "POST",
                body: {
                    email: email.value,
                    signed: signed.value,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                },
            });
        }

        await navigateTo ({
            path: "/admin/auth/login",
            query: { status: t ("password_reset"), },
        });
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
            errors.value = { password: t ("something_went_wrong"), };
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
        :title="t('reset_password_title')"
        :description="t('reset_password_description')"
    >
        <form @submit="submit">
        <div class="grid gap-6">
            <div>
                <Label for="email">{{ t("email") }}</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    :model-value="email"
                    readonly
                />
                <InputError :message="errors.email" />
            </div>

            <div>
                <Label for="password">{{ t("password") }}</Label>
                <Input
                    id="password"
                    v-model="data.password"
                    type="password"
                    name="password"
                    autocomplete="new-password"
                    autofocus
                    :placeholder="t('password_placeholder')"
                />
                <InputError :message="errors.password" />
            </div>

            <div>
                <Label for="password_confirmation">
                    {{ t("password_confirmation_label") }}
                </Label>
                <Input
                    id="password_confirmation"
                    v-model="data.password_confirmation"
                    type="password"
                    name="password_confirmation"
                    autocomplete="new-password"
                    :placeholder="t('password_confirmation_placeholder')"
                />
                <InputError :message="errors.password_confirmation" />
            </div>

            <Button
                type="submit"
                class="mt-2 w-full gap-2"
                :disabled="processing"
                data-test="reset-password-button"
            >
                <Spinner
                    v-if="processing"
                    class="h-4 w-4"
                />
                {{ processing ? t("resetting") : t("reset_password") }}
            </Button>
        </div>
        </form>
    </AuthLayout>
</template>
