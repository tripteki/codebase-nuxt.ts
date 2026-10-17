<script setup lang="ts">
import { computed, onMounted, ref, } from "vue";
import { useRoute, useRouter, useTranslation, } from "#imports";

import AdminFrame from "@/components/admin/AdminFrame.vue";
import AdminRowButton from "@/components/admin/AdminRowButton.vue";
import AdminListFilterPanel from "@/components/admin/AdminListFilterPanel.vue";
import AdminSearchInput from "@/components/admin/AdminSearchInput.vue";
import AdminSortableTableHead from "@/components/admin/AdminSortableTableHead.vue";
import AdminPagination from "@/components/admin/AdminPagination.vue";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton.vue";
import AlertError from "@/components/AlertError.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminActivities, } from "@/composables/useAdminActivities";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveActivityCauserAdminPath, resolveActivitySubjectAdminPath, } from "@/lib/admin-activity-subject";
import {
    applyPaginatedResult,
    useAdminListState,
} from "@/composables/useAdminListState";
import { toggleAdminListOrder, } from "@/lib/admin-list-params";
import { adminListRouteQuery, readAdminListRoute, } from "@/lib/admin-list-route";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { formatStamp, } from "@/lib/format-display";
import {
    fbAdminIndexScroll,
    fbAdminIndexShell,
    fbAdminIndexToolbar,
    fbAdminTable,
    fbAdminTableActions,
    fbAdminTableCell,
    fbAdminTableCellActions,
    fbAdminTableCellPrimary,
    fbAdminTableHead,
    fbAdminTableHeadActions,
    fbAdminTableHeadCell,
    fbAdminTableRow,
    fbInput,
    fbLink,
    fbMuted,
    fbSelect,
} from "@/lib/flowbite-classes";
import { UserRoleEnum, } from "@/lib/user-role";
import { ACTIVITY_SUBJECT_TYPES, type AdminActivity, } from "@/types/admin/activity";

definePageAuthed ();

const { canRender, } = useRequireAuth ();
const { can, roles, } = useAdminAccesses ();
const seesAllActivities = computed (() =>
    roles.value.includes (UserRoleEnum.Admin) || roles.value.includes (UserRoleEnum.Superadmin)
);
const { t, } = useTranslation ("common");
const { fetchActivities, } = useAdminActivities ();
const { items, meta, isLoading, } = useAdminListState<AdminActivity> ("admin-activities");
const route = useRoute ();
const router = useRouter ();
const listDefaults = { q: "", subject: "", from: "", to: "", causer: "", order: "created_at:desc", page: "1", };
const initialList = readAdminListRoute (route.query, listDefaults);
const q = ref (initialList.q);
const subjectType = ref (initialList.subject);
const dateFrom = ref (initialList.from);
const dateTo = ref (initialList.to);
const causer = ref (initialList.causer);
const order = ref (initialList.order);
const page = ref (Number (initialList.page) || 1);
const error = ref ("");
const filterOpen = ref (false);
const activeFilterCount = computed (() =>
    [subjectType.value, dateFrom.value, dateTo.value, causer.value,].filter ((value) => value.trim () !== "").length
);

async function load (): Promise<void> {
    const query = adminListRouteQuery ({
        q: q.value,
        subject: subjectType.value,
        from: dateFrom.value,
        to: dateTo.value,
        causer: causer.value,
        order: order.value,
        page: String (page.value),
    }, listDefaults);

    if (JSON.stringify (query) !== JSON.stringify (adminListRouteQuery (readAdminListRoute (route.query, listDefaults), listDefaults))) {
        void router.replace ({ query, });
    }

    isLoading.value = true;
    const result = await fetchActivities ({
        q: q.value,
        subjectType: subjectType.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        causer: causer.value,
        order: order.value,
        currentPage: page.value,
    });

    isLoading.value = false;

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    applyPaginatedResult (result, items, meta);
}

function clearFilters (): void {
    subjectType.value = "";
    dateFrom.value = "";
    dateTo.value = "";
    causer.value = "";
    page.value = 1;
    void load ();
}

function sortBy (field: string): void {
    order.value = toggleAdminListOrder (order.value, field);
    page.value = 1;
    void load ();
}

onMounted (() => {
    void load ();
});
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('activities')" :description="t (seesAllActivities ? 'activities_description' : 'activities_own_description')" :refresh-scopes="['activities']" @refresh="load">
        <AlertError :message="error" />
        <div :class="fbAdminIndexShell">
        <div :class="fbAdminIndexToolbar">
            <div class="min-w-0 max-w-xl flex-1" role="search">
                <label for="activities-search" class="sr-only">{{ t ("search") }}</label>
                <AdminSearchInput id="activities-search" v-model="q" :placeholder="t ('activities_search_placeholder')" @submit="page = 1; load ()" />
            </div>
            <AdminListFilterPanel :open="filterOpen" :active-count="activeFilterCount" @toggle="filterOpen = ! filterOpen" @clear="clearFilters">
                <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{{ t ("activities_column_subject") }}</label>
                <select v-model="subjectType" :class="fbSelect" @change="page = 1; load ()">
                    <option value="">{{ t ("activities_filter_all_subjects") }}</option>
                    <option v-for="subject in ACTIVITY_SUBJECT_TYPES" :key="subject" :value="subject">{{ t (`activities_filter_subject_${subject.toLowerCase ()}`) }}</option>
                </select>
                <label class="mb-2 mt-4 block text-sm font-medium text-gray-900 dark:text-white">{{ t ("activities_filter_date_from") }}</label>
                <input v-model="dateFrom" type="date" :class="fbInput" @change="page = 1; load ()">
                <label class="mb-2 mt-4 block text-sm font-medium text-gray-900 dark:text-white">{{ t ("activities_filter_date_to") }}</label>
                <input v-model="dateTo" type="date" :class="fbInput" @change="page = 1; load ()">
                <label class="mb-2 mt-4 block text-sm font-medium text-gray-900 dark:text-white">{{ t ("activities_filter_causer") }}</label>
                <input v-model="causer" :class="fbInput" :placeholder="t ('activities_filter_causer')" @change="page = 1; load ()">
            </AdminListFilterPanel>
        </div>
        <AdminTableSkeleton v-if="isLoading" :cols="6" />
        <div v-else :class="fbAdminIndexScroll">
            <div v-if="items.length === 0" class="px-6 py-8 text-center">
                <p :class="fbMuted">{{ t ("activities_empty") }}</p>
            </div>
            <table v-else :class="fbAdminTable">
                <thead :class="fbAdminTableHead">
                    <tr>
                        <AdminSortableTableHead :label="t ('activities_column_description')" field="description" :sort="order" @sort="sortBy" />
                        <th :class="fbAdminTableHeadCell">{{ t ("activities_column_causer") }}</th>
                        <AdminSortableTableHead :label="t ('activities_column_subject')" field="subject_type" :sort="order" @sort="sortBy" />
                        <AdminSortableTableHead :label="t ('activities_column_event')" field="event" :sort="order" @sort="sortBy" />
                        <AdminSortableTableHead :label="t ('activities_column_created')" field="created_at" :sort="order" @sort="sortBy" />
                        <th :class="[fbAdminTableHeadCell, fbAdminTableHeadActions,]">{{ t ("actions") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="activity in items" :key="activity.id" :class="fbAdminTableRow">
                        <td :class="fbAdminTableCellPrimary">{{ activity.description }}</td>
                        <td :class="fbAdminTableCell">
                            <NuxtLink
                                v-if="resolveActivityCauserAdminPath (activity.causer?.id, can)"
                                :class="fbLink"
                                :to="resolveActivityCauserAdminPath (activity.causer?.id, can) || undefined">
                                {{ activity.causer?.full_name || activity.causer?.email }}
                            </NuxtLink>
                            <span v-else>{{ activity.causer?.email || "-" }}</span>
                        </td>
                        <td :class="fbAdminTableCell">
                            <NuxtLink
                                v-if="resolveActivitySubjectAdminPath (activity.subject_type_label || activity.subject_type, activity.subject_id, can)"
                                :class="fbLink"
                                :to="resolveActivitySubjectAdminPath (activity.subject_type_label || activity.subject_type, activity.subject_id, can) || undefined">
                                {{ activity.subject_type_label || activity.subject_type }}
                            </NuxtLink>
                            <span v-else>{{ activity.subject_type_label || activity.subject_type || "-" }}</span>
                        </td>
                        <td :class="fbAdminTableCell">{{ activity.event }}</td>
                        <td :class="[fbAdminTableCell, 'whitespace-nowrap',]">{{ formatStamp (activity.created_at) }}</td>
                        <td :class="[fbAdminTableCell, fbAdminTableCellActions,]">
                            <div :class="fbAdminTableActions">
                                <AdminRowButton icon="view" :to="`/admin/activities/${activity.id}`">{{ t ("view") }}</AdminRowButton>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <AdminPagination :meta="meta" :page="page" @change="page = $event; load ()" />
        </div>
    </AdminFrame>
</template>
