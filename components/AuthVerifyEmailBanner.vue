<script setup lang="ts">
import { computed, ref, } from "vue";
import { useTranslation, } from "#imports";

import { Alert, AlertDescription, } from "@/components/ui/alert";
import { Button, } from "@/components/ui/button";
import { Spinner, } from "@/components/ui/spinner";

const { data, } = useAuth ();
const { t, } = useTranslation ("auth");

const processing = ref (false);
const message = ref ("");

const isUnverified = computed (() =>
{
    const user = data.value?.user as { email_verified_at?: string | null; } | undefined;

    return Boolean (user && ! user.email_verified_at);
});

async function resend (): Promise<void>
{
    processing.value = true;
    message.value = "";

    try
    {
        const response = await $fetch<{ message?: string; }> ("/api/auth/verification-notification", {
            method: "POST",
        });

        message.value = response.message || t ("verification-sent");
    }
    catch
    {
        message.value = t ("something_went_wrong");
    }
    finally
    {
        processing.value = false;
    }
}
</script>

<template>
    <div
        v-if="isUnverified"
        class="space-y-3"
    >
        <Alert class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AlertDescription>
                {{ t("email_not_verified_message") }}
            </AlertDescription>

            <Button
                type="button"
                variant="outline"
                size="sm"
                class="shrink-0 gap-2"
                :disabled="processing"
                @click="resend"
            >
                <Spinner
                    v-if="processing"
                    class="h-4 w-4"
                />
                {{ processing ? t("resending_verification_email") : t("resend_verification_email") }}
            </Button>
        </Alert>

        <p
            v-if="message"
            class="text-sm font-medium text-green-600"
        >
            {{ message }}
        </p>
    </div>
</template>
