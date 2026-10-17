<script setup lang="ts">
import { reactive, ref, computed, } from "vue";
import { definePageMeta, navigateTo, useHead, useTranslation, } from "#imports";

import AlertError from "@/components/AlertError.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import InputError from "@/components/InputError.vue";
import TextLink from "@/components/TextLink.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import {
    parseApiErrors,
    focusPasswordMatchError,
} from "@/lib/parse-api-errors";
import { useRequireGuest, } from "@/composables/useAuthGuard";
import { definePageGuest, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: false,
});

definePageGuest ();

const { t, } = useTranslation ("auth");
const { canRender, } = useRequireGuest ();

useHead ({
    title: computed (() => t ("register")),
});

const data = reactive ({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
});

const errors = ref<Record<string, string>>({});
const processing = ref (false);

async function submit (event: Event): Promise<void> {
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

    try {
        const response = await $fetch<{
            success?: boolean;
            data?: Record<string, unknown>;
            errors?: Record<string, string>;
        }>("/api/auth/register", {
            method: "POST",
            body: data,
        });

        if (response?.errors) {
            errors.value = focusPasswordMatchError (
                parseApiErrors (response, t ("registration_failed")),
                "password_confirmation"
            );
        } else if (response?.data || response?.success) {
            await navigateTo ({
                path: "/auth/login",
                query: { status: t ("verification-sent") },
            });
        } else {
            errors.value = { general: t ("registration_failed") };
        }
    } catch (error: any) {
        errors.value = focusPasswordMatchError (
            parseApiErrors (error?.data, t ("registration_failed")),
            "password_confirmation"
        );
    } finally {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        v-if="canRender"
        :title="t ('register_title')"
        :description="t ('register_description')">
        <form class="flex flex-col gap-4" method="post" novalidate @submit.prevent="submit">
            <AlertError :message="errors.general" />

            <div class="grid gap-4">
                <div class="grid gap-1.5">
                    <FbInput
                        icon="user"
                        id="name"
                        v-model="data.name"
                        type="text"
                        name="name"
                        required
                        autofocus
                        tabindex="1"
                        autocomplete="name"
                        :placeholder="t ('full_name_placeholder')"
                        :invalid="!! errors.name" />
                    <InputError :message="errors.name" />
                </div>

                <div class="grid gap-1.5">
                    <FbInput
                        icon="email"
                        id="email"
                        v-model="data.email"
                        type="email"
                        name="email"
                        required
                        tabindex="2"
                        autocomplete="email"
                        :placeholder="t ('email_placeholder')"
                        :invalid="!! errors.email" />
                    <InputError :message="errors.email" />
                </div>

                <div class="grid gap-1.5">
                    <FbInput
                        icon="password"
                        id="password"
                        v-model="data.password"
                        type="password"
                        name="password"
                        required
                        tabindex="3"
                        autocomplete="new-password"
                        :placeholder="t ('password_placeholder')"
                        :invalid="!! errors.password" />
                    <InputError :message="errors.password" />
                </div>

                <div class="grid gap-1.5">
                    <FbInput
                        icon="password"
                        id="password_confirmation"
                        v-model="data.password_confirmation"
                        type="password"
                        name="password_confirmation"
                        required
                        tabindex="4"
                        autocomplete="new-password"
                        :placeholder="t ('password_confirmation_placeholder')"
                        :invalid="!! errors.password_confirmation" />
                    <InputError :message="errors.password_confirmation" />
                </div>

                <FbButton
                    type="submit"
                    class="w-full"
                    tabindex="5"
                    :disabled="processing"
                    data-test="register-user-button">
                    <FbSpinner v-if="processing" />
                    {{ processing ? t ("registering") : t ("create_account") }}
                </FbButton>
            </div>

            <div class="text-center text-sm text-white/80">
                {{ t ("already_have_account") }}{{ " " }}
                <TextLink to="/auth/login" class="underline" tabindex="6">
                    {{ t ("log_in") }}
                </TextLink>
            </div>
        </form>
    </AuthLayout>
</template>
