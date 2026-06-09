<script setup lang="ts">
import { computed, } from "vue";
import { definePageMeta, useHead, useTranslation, } from "#imports";

import FooterLayout from "@/components/FooterLayout.vue";
import HeaderLayout from "@/components/HeaderLayout.vue";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

definePageMeta ({
    auth: true,
    middleware: "app-auth",
});

const { t, } = useTranslation ("common");

useHead ({
    title: computed (() => t ("dashboard")),
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-background">
        <HeaderLayout show-logout />

        <main class="flex-1 container mx-auto px-4 py-8">
            <div class="space-y-8">
                <div class="space-y-2">
                    <h1 class="text-3xl font-bold tracking-tight">
                        {{ t("dashboard_title") }}
                    </h1>
                    <p class="text-muted-foreground">
                        {{ t("dashboard_description") }}
                    </p>
                </div>

                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>{{ t("overview") }}</CardTitle>
                            <CardDescription>
                                {{ t("overview_description") }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm text-muted-foreground">
                                {{ t("overview_content") }}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{{ t("statistics") }}</CardTitle>
                            <CardDescription>
                                {{ t("statistics_description") }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm text-muted-foreground">
                                {{ t("statistics_content") }}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{{ t("activity") }}</CardTitle>
                            <CardDescription>
                                {{ t("activity_description") }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm text-muted-foreground">
                                {{ t("activity_content") }}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>

        <FooterLayout />
    </div>
</template>
