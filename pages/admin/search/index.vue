<script setup lang="ts">
import { onMounted, ref, watch, } from "vue";
import { useRoute, useTranslation, } from "#imports";

import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import { useAdminSearch, } from "@/composables/useAdminSearch";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { fbMuted, } from "@/lib/flowbite-classes";
import type { AdminSearchResult, } from "@/types/admin/search";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { search, } = useAdminSearch ();
const result = ref<AdminSearchResult | null> (null);
const error = ref ("");

async function load (): Promise<void> {
    const q = String (route.query.q || "").trim ();
    const category = String (route.query.category || "all");

    result.value = null;
    error.value = "";

    if (q.length < 2) {
        return;
    }

    const response = await search (q, category);

    if (! response.isSuccess) {
        error.value = resolveCallErrorMessage (response.error, t ("something_went_wrong"));

        return;
    }

    result.value = response.data as AdminSearchResult;
}

onMounted (() => {
    void load ();
});

watch (() => [route.query.q, route.query.category], () => {
    void load ();
});
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('search')">
        <AlertError :message="error" />
        <p v-if="! result" :class="fbMuted">{{ t ("no_results") }}</p>
        <section v-for="group in result?.results || []" :key="group.category" class="space-y-2">
            <h2 class="text-lg font-semibold">{{ t (group.category) }}</h2>
            <p v-if="group.items.length === 0" :class="fbMuted">{{ t ("no_results") }}</p>
            <ul v-else class="space-y-1 text-sm">
                <li v-for="item in group.items" :key="item.id">
                    <NuxtLink class="underline" :to="item.url">{{ item.title }}</NuxtLink>
                    <span v-if="item.subtitle" :class="fbMuted"> — {{ item.subtitle }}</span>
                </li>
            </ul>
        </section>
    </AdminFrame>
</template>
