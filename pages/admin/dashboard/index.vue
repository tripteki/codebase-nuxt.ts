<script setup lang="ts">
import { computed, onMounted, ref, } from "vue";
import { useHead, useTranslation, } from "#imports";

import AdminChartSkeleton from "@/components/admin/AdminChartSkeleton.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import FbApexChart from "@/components/flowbite/FbApexChart.client.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { useAdminDashboard, } from "@/composables/useAdminDashboard";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { formatStamp, humanizeToken, } from "@/lib/format-display";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { fbCard, fbCardTitle, fbMuted, } from "@/lib/flowbite-classes";
import type { AdminDashboard, } from "@/types/admin/dashboard";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { fetchDashboard, } = useAdminDashboard ();
const dashboard = ref<AdminDashboard | null> (null);
const error = ref ("");

function notificationHref (url?: string | null): string {
    const fallback = dashboard.value?.links.notifications || "/notifications";
    const target = (url || "").trim ();

    if (! target) {
        return fallback;
    }

    if (target.startsWith ("http://") || target.startsWith ("https://") || target.startsWith ("/")) {
        return target;
    }

    return `/${target}`;
}

function notificationIsExternal (url: string): boolean {
    return url.startsWith ("http://") || url.startsWith ("https://");
}

function roleLabel (key: string): string {
    const translated = t (`role_${key}`);

    if (translated === `role_${key}` || translated.endsWith (`.role_${key}`)) {
        return key;
    }

    return translated;
}

const usersByRoleChart = computed (() => {
    const rows = dashboard.value?.users?.by_role ?? {};
    const keys = Object.keys (rows);

    return {
        series: [
            {
                name: t ("by_role"),
                data: keys.map ((key) => Number (rows[key] ?? 0)),
            },
        ],
        options: {
            dataLabels: { enabled: true, },
            chart: { parentHeightOffset: 0, toolbar: { show: false, }, },
            grid: { padding: { left: 8, right: 16, }, },
            plotOptions: {
                bar: { horizontal: true, borderRadius: 4, barHeight: "55%", },
            },
            xaxis: { categories: keys.map ((key) => roleLabel (key)), },
        },
    };
});

useHead ({
    title: computed (() => t ("dashboard")),
});

async function load (): Promise<void> {
    const result = await fetchDashboard ();

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    error.value = "";
    dashboard.value = result.data as AdminDashboard;
}

onMounted (async () => {
    await load ();
});
</script>

<template>
    <AdminFrame
        v-if="canRender"
        :title="t ('dashboard_title')"
        :description="t ('dashboard_description')"
        :refresh-scopes="['users', 'roles', 'permissions', 'activities']"
        @refresh="load">
        <AlertError :message="error" />
        <AdminChartSkeleton v-if="! dashboard && ! error" />
        <div v-if="dashboard?.users" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div :class="fbCard" class="text-center"><h3 :class="fbCardTitle">{{ t ("total_users") }}</h3><p class="mt-2 text-3xl font-bold">{{ dashboard.users.total }}</p></div>
            <div :class="fbCard" class="text-center"><h3 :class="fbCardTitle">{{ t ("active_users") }}</h3><p class="mt-2 text-3xl font-bold">{{ dashboard.users.active }}</p></div>
            <div :class="fbCard" class="text-center"><h3 :class="fbCardTitle">{{ t ("deactivated_users") }}</h3><p class="mt-2 text-3xl font-bold">{{ dashboard.users.deactivated }}</p></div>
            <div :class="fbCard" class="text-center"><h3 :class="fbCardTitle">{{ t ("unverified_users") }}</h3><p class="mt-2 text-3xl font-bold">{{ dashboard.users.unverified }}</p></div>
            <div :class="fbCard" class="text-center"><h3 :class="fbCardTitle">{{ t ("new_in_period") }}</h3><p class="mt-2 text-3xl font-bold">{{ dashboard.users.new_in_period }}</p></div>
        </div>
        <div v-if="dashboard" class="grid gap-4 lg:grid-cols-2">
            <div v-if="dashboard.users" :class="fbCard">
                <div class="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <h3 :class="fbCardTitle">{{ t ("by_role") }}</h3>
                        <p :class="fbMuted">{{ t ("dashboard_users_by_role_description") }}</p>
                    </div>
                    <FbButton variant="outline" size="sm" :to="dashboard.links.users">{{ t ("users") }}</FbButton>
                </div>
                <ClientOnly>
                    <FbApexChart
                        type="bar"
                        :height="320"
                        :series="usersByRoleChart.series"
                        :options="usersByRoleChart.options" />
                </ClientOnly>
            </div>
            <div :class="fbCard">
                <div class="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <h3 :class="fbCardTitle">{{ t ("recent_notifications") }}</h3>
                        <p :class="fbMuted">{{ dashboard.unread_notifications }} {{ t ("unread_count") }}</p>
                    </div>
                    <FbButton variant="outline" size="sm" :to="dashboard.links.notifications">{{ t ("notifications") }}</FbButton>
                </div>
                <p v-if="! dashboard.recent_notifications.length" :class="fbMuted">{{ t ("dashboard_notifications_empty") }}</p>
                <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                    <li v-for="notification in dashboard.recent_notifications" :key="notification.id" class="py-3">
                        <NuxtLink
                            class="block hover:opacity-90"
                            :to="notificationHref (notification.url)"
                            :external="notificationIsExternal (notificationHref (notification.url))"
                            :target="notificationIsExternal (notificationHref (notification.url)) ? '_blank' : undefined">
                            <p class="font-medium">{{ humanizeToken (notification.title || notification.type || "") }}</p>
                            <p :class="fbMuted" class="text-sm">{{ notification.body || formatStamp (notification.created_at) }}</p>
                        </NuxtLink>
                    </li>
                </ul>
            </div>
            <div :class="fbCard">
                <div class="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <h3 :class="fbCardTitle">{{ t ("recent_activities") }}</h3>
                        <p :class="fbMuted">{{ t (dashboard.activities_scope === "own" ? "dashboard_activities_own" : "dashboard_activities_all") }}</p>
                    </div>
                    <FbButton variant="outline" size="sm" :to="dashboard.links.activities">{{ t ("activities") }}</FbButton>
                </div>
                <p v-if="! dashboard.recent_activities?.length" :class="fbMuted">{{ t ("dashboard_activities_empty") }}</p>
                <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                    <li v-for="activity in dashboard.recent_activities" :key="activity.id" class="py-3">
                        <NuxtLink class="block" :to="`${dashboard.links.activities}/${activity.id}`">
                            <p class="font-medium">{{ activity.description }}</p>
                            <p :class="fbMuted" class="text-sm">{{ formatStamp (activity.created_at) }}</p>
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </div>
    </AdminFrame>
</template>
