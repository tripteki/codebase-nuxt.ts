<script setup lang="ts">
import { computed, onMounted, } from "vue";
import { useRoute, useTranslation, } from "#imports";

import AdminSearchBox from "@/components/admin/AdminSearchBox.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { ADMIN_NAVIGATION, } from "@/lib/admin-navigation";

const route = useRoute ();
const { t, } = useTranslation ("common");
const { can, ensureLoaded, } = useAdminAccesses ();

const items = computed (() =>
    ADMIN_NAVIGATION.filter ((item) => can (item.permission))
);

onMounted (() => {
    void ensureLoaded ();
});
</script>

<template>
    <nav class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="container mx-auto flex flex-wrap items-center gap-3 px-4 py-3">
            <NuxtLink
                v-for="item in items"
                :key="item.key"
                :to="item.to"
                class="rounded-md px-3 py-1.5 text-sm"
                :class="route.path.startsWith (item.to)
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'">
                {{ t (item.key) }}
            </NuxtLink>

            <AdminSearchBox />
        </div>
    </nav>
</template>
