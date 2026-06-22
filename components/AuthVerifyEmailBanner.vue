<script setup lang="ts">
import { computed, ref, } from "vue";
import { useTranslation, } from "#imports";

import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import { Alert, } from "@/components/ui/alert";
import { Button, } from "@/components/ui/button";
import { Spinner, } from "@/components/ui/spinner";

const { data, } = useAuth ();
const { t, } = useTranslation ("auth");

const processing = ref (false);
const successMessage = ref ("");
const errorMessage = ref ("");

const isUnverified = computed (() => {
    const user = data.value?.user as
        | { email_verified_at?: string | null }
        | undefined;

    return Boolean (user && ! user.email_verified_at);
});

async function resend (): Promise<void> {
    processing.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
        const response = await $fetch<{ message?: string }>(
            "/api/auth/verification-notification",
            {
                method: "POST",
            }
        );

        successMessage.value = response.message || t ("verification-sent");
    } catch {
        errorMessage.value = t ("something_went_wrong");
    } finally {
        processing.value = false;
    }
}
</script>

<template>
    <div v-if="isUnverified" class="space-y-3">
        <Alert
            class="mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-muted-foreground">
                {{ t ("email_not_verified_message") }}
            </p>

            <Button
                type="button"
                variant="outline"
                size="sm"
                class="shrink-0"
                :disabled="processing"
                @click="resend">
                <Spinner v-if="processing" />
                {{
                    processing
                        ? t ("resending_verification_email")
                        : t ("resend_verification_email")
                }}
            </Button>
        </Alert>

        <AlertSuccess :message="successMessage || undefined" />
        <AlertError :message="errorMessage || undefined" />
    </div>
</template>
