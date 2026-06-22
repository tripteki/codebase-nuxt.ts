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
import AlertError from "@/components/AlertError.vue";
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Spinner, } from "@/components/ui/spinner";
import { parseApiErrors, } from "@/lib/parse-api-errors";
import { cn, } from "@/lib/utils";
import { definePagePublic, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: false,
    middleware: ["auth-reset-email"],
});

definePagePublic ();

const { t, } = useTranslation ("auth");
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

const errors = ref<Record<string, string>>({});
const processing = ref (false);

async function submit (event: Event): Promise<void> {
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

    try {
        const response = await $fetch<{
            success?: boolean;
            message?: string;
            errors?: Record<string, string>;
        }>("/api/auth/reset-password", {
            method: "POST",
            body: {
                email: email.value,
                signed: signed.value,
                password: data.password,
                password_confirmation: data.password_confirmation,
            },
        });

        if (response?.errors) {
            errors.value = parseApiErrors (response, t ("something_went_wrong"));
        } else if (response?.success) {
            await navigateTo ({
                path: "/admin/auth/login",
                query: { status: t ("password_reset") },
            });
        } else {
            errors.value = { password: t ("something_went_wrong") };
        }
    } catch (error: any) {
        errors.value = parseApiErrors (error?.data, t ("something_went_wrong"));
    } finally {
        processing.value = false;
    }
}
</script>

<template>
    <AuthLayout
        :title="t ('reset_password_title')"
        :description="t ('reset_password_description')">
        <form novalidate @submit.prevent="submit">
            <AlertError :message="errors.general" />

            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label html-for="email">{{ t ("email") }}</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        :model-value="email"
                        class="mt-1 block w-full"
                        readonly />
                    <InputError :message="errors.email" />
                </div>

                <div class="grid gap-2">
                    <Label html-for="password">{{ t ("password") }}</Label>
                    <Input
                        id="password"
                        v-model="data.password"
                        type="password"
                        name="password"
                        autocomplete="new-password"
                        class="mt-1 block w-full"
                        autofocus
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
                        autocomplete="new-password"
                        class="mt-1 block w-full"
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
                    class="mt-4 w-full"
                    :disabled="processing"
                    data-test="reset-password-button">
                    <Spinner v-if="processing" />
                    {{ processing ? t ("resetting") : t ("reset_password") }}
                </Button>
            </div>
        </form>
    </AuthLayout>
</template>
