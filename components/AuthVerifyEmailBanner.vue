<script setup lang="ts">
import { computed, ref, } from "vue";
import { useTranslation, } from "#imports";

import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import FbSpinner from "@/components/flowbite/FbSpinner.vue";
import { fbMuted, fbSurfacePanel, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

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
        <div
            :class="
                cn (
                    fbSurfacePanel,
                    'mb-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'
                )
            ">
            <p :class="fbMuted">
                {{ t ("email_not_verified_message") }}
            </p>

            <FbButton
                type="button"
                variant="outline"
                size="sm"
                class="shrink-0"
                :disabled="processing"
                @click="resend">
                <FbSpinner v-if="processing" class="h-4 w-4" />
                {{
                    processing
                        ? t ("resending_verification_email")
                        : t ("resend_verification_email")
                }}
            </FbButton>
        </div>

        <AlertSuccess :message="successMessage || undefined" />
        <AlertError :message="errorMessage || undefined" />
    </div>
</template>
