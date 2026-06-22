<script setup lang="ts">
import { reactive, ref, computed, } from "vue";
import { definePageMeta, navigateTo, useHead, useTranslation, } from "#imports";

import AlertError from "@/components/AlertError.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import InputError from "@/components/InputError.vue";
import TextLink from "@/components/TextLink.vue";
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Spinner, } from "@/components/ui/spinner";
import {
    parseApiErrors,
    focusPasswordMatchError,
} from "@/lib/parse-api-errors";
import { cn, } from "@/lib/utils";
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
                path: "/admin/auth/login",
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
        <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
            <AlertError :message="errors.general" />

            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label html-for="name">{{ t ("name") }}</Label>
                    <Input
                        id="name"
                        v-model="data.name"
                        type="text"
                        name="name"
                        required
                        autofocus
                        tabindex="1"
                        autocomplete="name"
                        :placeholder="t ('username')"
                        :aria-invalid="!! errors.name"
                        :class="
                            cn (
                                errors.name &&
                                    'border-destructive focus-visible:ring-destructive/30'
                            )
                        " />
                    <InputError :message="errors.name" />
                </div>

                <div class="grid gap-2">
                    <Label html-for="email">{{ t ("email_address") }}</Label>
                    <Input
                        id="email"
                        v-model="data.email"
                        type="email"
                        name="email"
                        required
                        tabindex="2"
                        autocomplete="email"
                        :placeholder="t ('email_placeholder')"
                        :aria-invalid="!! errors.email"
                        :class="
                            cn (
                                errors.email &&
                                    'border-destructive focus-visible:ring-destructive/30'
                            )
                        " />
                    <InputError :message="errors.email" />
                </div>

                <div class="grid gap-2">
                    <Label html-for="password">{{ t ("password") }}</Label>
                    <Input
                        id="password"
                        v-model="data.password"
                        type="password"
                        name="password"
                        required
                        tabindex="3"
                        autocomplete="new-password"
                        :placeholder="t ('password_placeholder')"
                        :aria-invalid="!! errors.password"
                        :class="
                            cn (
                                errors.password &&
                                    'border-destructive focus-visible:ring-destructive/30'
                            )
                        " />
                    <InputError :message="errors.password" />
                </div>

                <div class="grid gap-2">
                    <Label html-for="password_confirmation">
                        {{ t ("password_confirmation_label") }}
                    </Label>
                    <Input
                        id="password_confirmation"
                        v-model="data.password_confirmation"
                        type="password"
                        name="password_confirmation"
                        required
                        tabindex="4"
                        autocomplete="new-password"
                        :placeholder="t ('password_confirmation_placeholder')"
                        :aria-invalid="!! errors.password_confirmation"
                        :class="
                            cn (
                                errors.password_confirmation &&
                                    'border-destructive focus-visible:ring-destructive/30'
                            )
                        " />
                    <InputError :message="errors.password_confirmation" />
                </div>

                <Button
                    type="submit"
                    class="mt-2 w-full"
                    tabindex="5"
                    :disabled="processing"
                    data-test="register-user-button">
                    <Spinner v-if="processing" />
                    {{ processing ? t ("registering") : t ("create_account") }}
                </Button>
            </div>

            <div class="text-center text-sm text-muted-foreground">
                {{ t ("already_have_account") }}{{ " " }}
                <TextLink to="/admin/auth/login" tabindex="6">
                    {{ t ("log_in") }}
                </TextLink>
            </div>
        </form>
    </AuthLayout>
</template>
