<script setup lang="ts">
import { computed, } from "vue";
import {
    definePageMeta,
    useHead,
    useRuntimeConfig,
    useTranslation,
} from "#imports";

import FooterLayout from "@/components/FooterLayout.vue";
import HeaderLayout from "@/components/HeaderLayout.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { fbMuted, fbPage, } from "@/lib/flowbite-classes";
import { resolveApiDocsUrl, } from "@/lib/api-base";
import { definePagePublic, } from "@/lib/define-page-auth";

definePageMeta ({
    layout: "default",
});

definePagePublic ();

const { t, } = useTranslation ("common");
const runtimeConfig = useRuntimeConfig ();

const apiDocsUrl = computed (() =>
    resolveApiDocsUrl ({
        apiUrl: runtimeConfig.public.apiUrl,
        baseURL: runtimeConfig.public.baseURL,
    })
);

useHead ({
    title: computed (() => t ("welcome")),
});
</script>

<template>
    <div :class="fbPage">
        <HeaderLayout />

        <main class="flex flex-1 items-center justify-center px-4 py-16">
            <div class="max-w-2xl space-y-8 text-center">
                <div class="space-y-4">
                    <h2 class="text-4xl font-bold tracking-tight sm:text-5xl">
                        {{ t ("title") }}
                        <br />
                        <span class="text-[var(--brand-primary)]">{{
                            t ("subtitle")
                        }}</span>
                    </h2>

                    <p :class="['text-xl', fbMuted]">
                        {{ t ("description") }}
                    </p>
                </div>

                <div class="flex justify-center gap-4">
                    <FbButton size="lg" to="/admin/auth/login">
                        {{ t ("get_started") }}
                    </FbButton>
                    <FbButton
                        variant="outline"
                        size="lg"
                        :href="apiDocsUrl">
                        {{ t ("view_docs") }}
                    </FbButton>
                </div>
            </div>
        </main>

        <FooterLayout />
    </div>
</template>
