<script setup lang="ts">
import { computed, watch, } from "vue";
import { navigateTo, useHead, useRoute, useTranslation, } from "#imports";

import AdminFrame from "@/components/admin/AdminFrame.vue";
import AdminSystemSettings from "@/components/admin/AdminSystemSettings.vue";
import ProfileSettingsForm from "@/components/admin/ProfileSettingsForm.vue";
import { adminSegmentTabClass, } from "@/lib/admin-tabs";
import {
    fbCard,
    fbCardDescription,
    fbCardTitle,
    fbSurfacePanel,
} from "@/lib/flowbite-classes";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { definePageAuthed, } from "@/lib/define-page-auth";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { isSuperadmin, loaded, ensureLoaded, } = useAdminAccesses ();
const { t, } = useTranslation ("common");
const tab = computed (() => String (route.params.tab || "personal"));

useHead ({
    title: computed (() => tab.value === "system" ? t ("settings_tab_system") : t ("settings_tab_personal")),
});

watch ([tab, loaded, isSuperadmin], async () => {
    await ensureLoaded ();

    if (! loaded.value) {
        return;
    }

    if (tab.value !== "personal" && tab.value !== "system") {
        await navigateTo ("/admin/settings/personal", { replace: true, });

        return;
    }

    if (tab.value === "system" && ! isSuperadmin.value) {
        await navigateTo ("/admin/settings/personal", { replace: true, });
    }
}, { immediate: true, });
</script>

<template>
    <AdminFrame
        v-if="canRender"
        :title="tab === 'system' ? t ('settings_tab_system') : t ('settings_tab_personal')"
        :description="tab === 'system' ? t ('system_settings_description') : t ('profile_settings_description')">
        <div :class="[fbSurfacePanel, 'shadow']">
            <div class="border-b border-gray-200 p-4 sm:p-5 dark:border-gray-700">
                <ul
                    v-if="loaded"
                    class="flex overflow-x-auto text-center text-xs font-medium text-gray-500 sm:-space-x-px sm:text-sm dark:text-gray-400"
                    role="tablist"
                    :aria-label="t ('settings')">
                    <li class="w-full" role="presentation">
                        <NuxtLink
                            role="tab"
                            :aria-selected="tab === 'personal'"
                            :class="[adminSegmentTabClass (tab === 'personal'), isSuperadmin ? 'rounded-l-lg' : 'rounded-lg']"
                            to="/admin/settings/personal">
                            {{ t ("settings_tab_personal") }}
                        </NuxtLink>
                    </li>
                    <li v-if="isSuperadmin" class="w-full" role="presentation">
                        <NuxtLink
                            role="tab"
                            :aria-selected="tab === 'system'"
                            :class="[adminSegmentTabClass (tab === 'system'), 'rounded-r-lg']"
                            to="/admin/settings/system">
                            {{ t ("settings_tab_system") }}
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </div>
        <div v-if="tab === 'personal'" class="mx-auto max-w-2xl">
            <div :class="fbCard">
                <div class="mb-6 space-y-1.5">
                    <h3 :class="fbCardTitle">{{ t ("personal_information") }}</h3>
                    <p :class="fbCardDescription">{{ t ("personal_information_description") }}</p>
                </div>
                <ProfileSettingsForm />
            </div>
        </div>
        <AdminSystemSettings v-else-if="tab === 'system' && isSuperadmin" />
    </AdminFrame>
</template>
