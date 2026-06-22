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
import { Button, } from "@/components/ui/button";
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
    <div class="min-h-screen flex flex-col bg-background">
        <HeaderLayout />

        <main class="flex-1 flex items-center justify-center px-4 py-16">
            <div class="text-center space-y-8 max-w-2xl">
                <div class="space-y-4">
                    <h2 class="text-4xl font-bold tracking-tight sm:text-5xl">
                        {{ t ("title") }}
                        <br />
                        <span class="text-primary">{{ t ("subtitle") }}</span>
                    </h2>

                    <p class="text-xl text-muted-foreground">
                        {{ t ("description") }}
                    </p>
                </div>

                <div class="flex gap-4 justify-center">
                    <Button size="lg" as-child>
                        <NuxtLink to="/admin/auth/login">
                            {{ t ("get_started") }}
                        </NuxtLink>
                    </Button>
                    <Button variant="outline" size="lg" as-child>
                        <a
                            :href="apiDocsUrl"
                            target="_blank"
                            rel="noopener noreferrer">
                            {{ t ("view_docs") }}
                        </a>
                    </Button>
                </div>
            </div>
        </main>

        <FooterLayout />
    </div>
</template>
