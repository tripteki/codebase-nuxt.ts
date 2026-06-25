<script setup lang="ts">
import { computed, } from "vue";
import { useHead, useTranslation, } from "#imports";

import FooterLayout from "@/components/FooterLayout.vue";
import AuthVerifyEmailBanner from "@/components/AuthVerifyEmailBanner.vue";
import HeaderLayout from "@/components/HeaderLayout.vue";
import ProfileSettingsForm from "@/components/admin/ProfileSettingsForm.vue";
import {
    fbCard,
    fbCardDescription,
    fbCardTitle,
    fbMuted,
    fbPage,
} from "@/lib/flowbite-classes";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { definePageAuthed, } from "@/lib/define-page-auth";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");

useHead ({
    title: computed (() => t ("profile_settings")),
});
</script>

<template>
    <div v-if="canRender" :class="fbPage">
        <HeaderLayout show-logout />

        <main class="container mx-auto flex-1 px-4 py-8">
            <div class="mx-auto max-w-2xl space-y-6">
                <AuthVerifyEmailBanner />

                <div class="space-y-2">
                    <h1 class="text-3xl font-bold tracking-tight">
                        {{ t ("profile_settings") }}
                    </h1>
                    <p :class="fbMuted">
                        {{ t ("profile_settings_description") }}
                    </p>
                </div>

                <div :class="fbCard">
                    <div class="mb-6 space-y-1.5">
                        <h3 :class="fbCardTitle">
                            {{ t ("personal_information") }}
                        </h3>
                        <p :class="fbCardDescription">
                            {{ t ("personal_information_description") }}
                        </p>
                    </div>
                    <ProfileSettingsForm />
                </div>
            </div>
        </main>

        <FooterLayout />
    </div>
</template>
