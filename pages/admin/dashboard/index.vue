<script setup lang="ts">
import { computed, } from "vue";
import { useHead, useTranslation, } from "#imports";

import FooterLayout from "@/components/FooterLayout.vue";
import AuthVerifyEmailBanner from "@/components/AuthVerifyEmailBanner.vue";
import HeaderLayout from "@/components/HeaderLayout.vue";
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
    title: computed (() => t ("dashboard")),
});
</script>

<template>
    <div v-if="canRender" :class="fbPage">
        <HeaderLayout show-logout />

        <main class="container mx-auto flex-1 px-4 py-8">
            <div class="space-y-8">
                <AuthVerifyEmailBanner />

                <div class="space-y-2">
                    <h1 class="text-3xl font-bold tracking-tight">
                        {{ t ("dashboard_title") }}
                    </h1>
                    <p :class="fbMuted">
                        {{ t ("dashboard_description") }}
                    </p>
                </div>

                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div :class="fbCard">
                        <div class="mb-4 space-y-1.5">
                            <h3 :class="fbCardTitle">{{ t ("overview") }}</h3>
                            <p :class="fbCardDescription">
                                {{ t ("overview_description") }}
                            </p>
                        </div>
                        <p :class="fbMuted">
                            {{ t ("overview_content") }}
                        </p>
                    </div>

                    <div :class="fbCard">
                        <div class="mb-4 space-y-1.5">
                            <h3 :class="fbCardTitle">{{ t ("statistics") }}</h3>
                            <p :class="fbCardDescription">
                                {{ t ("statistics_description") }}
                            </p>
                        </div>
                        <p :class="fbMuted">
                            {{ t ("statistics_content") }}
                        </p>
                    </div>

                    <div :class="fbCard">
                        <div class="mb-4 space-y-1.5">
                            <h3 :class="fbCardTitle">{{ t ("activity") }}</h3>
                            <p :class="fbCardDescription">
                                {{ t ("activity_description") }}
                            </p>
                        </div>
                        <p :class="fbMuted">
                            {{ t ("activity_content") }}
                        </p>
                    </div>
                </div>
            </div>
        </main>

        <FooterLayout />
    </div>
</template>
