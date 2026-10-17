<script setup lang="ts">
import { onMounted, } from "vue";

import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";
import AuthVerifyEmailBanner from "@/components/AuthVerifyEmailBanner.vue";
import FooterLayout from "@/components/FooterLayout.vue";
import HeaderLayout from "@/components/HeaderLayout.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminRefresh, } from "@/composables/useAdminRefresh";
import { fbPage, } from "@/lib/flowbite-classes";

const props = defineProps<{
    title: string;
    description?: string;
    refreshScopes?: string[];
}> ();

const emit = defineEmits<{
    refresh: [];
}> ();

const { ensureLoaded, } = useAdminAccesses ();

useAdminRefresh (() => props.refreshScopes ?? [], () => emit ("refresh"));

onMounted (() => {
    void ensureLoaded ();
});
</script>

<template>
    <div :class="[fbPage, 'lg:pl-64',]">
        <AdminSidebar />
        <HeaderLayout show-logout />

        <main id="admin-main-content" class="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 lg:px-6">
            <div class="space-y-6">
                <AuthVerifyEmailBanner />
                <AdminPageHeader :title="title" :description="description">
                    <template v-if="$slots.actions" #actions>
                        <slot name="actions" />
                    </template>
                </AdminPageHeader>
                <slot />
            </div>
        </main>

        <FooterLayout />
    </div>
</template>
