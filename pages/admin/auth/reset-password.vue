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
import FbButton from "@/components/flowbite/FbButton.vue";
import FbInput from "@/components/flowbite/FbInput.vue";
import FbLabel from "@/components/flowbite/FbLabel.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import {
    parseApiErrors,
    focusPasswordMatchError,
} from "@/lib/parse-api-errors";
import { definePagePublic, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: false,
});

definePagePublic ();

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

const errors = ref<Record<string, string>>({});
const processing = ref (false);

async function submit (event: Event): Promise<void> {
    event.preventDefault ();
    processing.value = true;
    errors.value = {};

    try {
        if (token.value) {
            await $fetch ("/api/auth/reset-password", {
                method: "POST",
                body: {
                    token: token.value,
                    email: email.value,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                },
            });
        } else {
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
            query: { status: t ("password_reset") },
        });
    } catch (throwable: unknown) {
        const payload = (throwable as { data?: Record<string, unknown> })?.data;

        errors.value = focusPasswordMatchError (
            parseApiErrors (payload, t ("something_went_wrong")),
            "password"
        );
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
                    <FbLabel html-for="email">{{ t ("email") }}</FbLabel>
                    <FbInput
                        id="email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        :model-value="email"
                        readonly />
                    <InputError :message="errors.email" />
                </div>

                <div class="grid gap-2">
                    <FbLabel html-for="password">{{ t ("password") }}</FbLabel>
                    <FbInput
                        id="password"
                        v-model="data.password"
                        type="password"
                        name="password"
                        autocomplete="new-password"
                        autofocus
                        :placeholder="t ('password_placeholder')"
                        :invalid="!! errors.password" />
                    <InputError :message="errors.password" />
                </div>

                <div class="grid gap-2">
                    <FbLabel html-for="password_confirmation">
                        {{ t ("password_confirmation_label") }}
                    </FbLabel>
                    <FbInput
                        id="password_confirmation"
                        v-model="data.password_confirmation"
                        type="password"
                        name="password_confirmation"
                        autocomplete="new-password"
                        :placeholder="t ('password_confirmation_placeholder')"
                        :invalid="!! errors.password_confirmation" />
                    <InputError :message="errors.password_confirmation" />
                </div>

                <FbButton
                    type="submit"
                    class="mt-2 w-full gap-2"
                    :disabled="processing"
                    data-test="reset-password-button">
                    <FbSpinner v-if="processing" />
                    {{ processing ? t ("resetting") : t ("reset_password") }}
                </FbButton>
            </div>
        </form>
    </AuthLayout>
</template>
