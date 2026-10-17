<script setup lang="ts">
import { onMounted, ref, } from "vue";
import { useRoute, useRouter, useTranslation, } from "#imports";

import AdminConfirmModal from "@/components/admin/AdminConfirmModal.vue";
import AdminExportModal from "@/components/admin/AdminExportModal.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AdminRowButton from "@/components/admin/AdminRowButton.vue";
import AdminListFilterPanel from "@/components/admin/AdminListFilterPanel.vue";
import AdminSearchInput from "@/components/admin/AdminSearchInput.vue";
import AdminSortableTableHead from "@/components/admin/AdminSortableTableHead.vue";
import AdminImportModal from "@/components/admin/AdminImportModal.vue";
import AdminPagination from "@/components/admin/AdminPagination.vue";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton.vue";
import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminRoles, } from "@/composables/useAdminRoles";
import type { AclExportFormat, } from "@/lib/admin-export";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { formatStamp, } from "@/lib/format-display";
import {
    applyPaginatedResult,
    useAdminListState,
} from "@/composables/useAdminListState";
import { toggleAdminListOrder, } from "@/lib/admin-list-params";
import { adminListRouteQuery, readAdminListRoute, } from "@/lib/admin-list-route";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { downloadRoleImportSample, } from "@/lib/samples/roles";
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
    fbLink,
    fbMuted,
    fbSelect,
} from "@/lib/flowbite-classes";
import type { AdminRole, } from "@/types/admin/role";

definePageAuthed ();

const exportFormats: AclExportFormat[] = ["csv", "xlsx"];
const { canRender, } = useRequireAuth ();
const { t, } = useTranslation ("common");
const { can, } = useAdminAccesses ();
const { fetchRoles, destroy, importRoles, exportRoles, } = useAdminRoles ();
const { items, meta, isLoading, } = useAdminListState<AdminRole> ("admin-role-list");
const route = useRoute ();
const router = useRouter ();
const listDefaults = { q: "", guard: "", order: "name:asc", page: "1", };
const initialList = readAdminListRoute (route.query, listDefaults);
const q = ref (initialList.q);
const guard = ref (initialList.guard);
const filterOpen = ref (false);
const order = ref (initialList.order);
const exportType = ref<AclExportFormat> ("csv");
const importOpen = ref (false);
const exportOpen = ref (false);
const confirmOpen = ref (false);
const confirmId = ref ("");
const page = ref (Number (initialList.page) || 1);
const message = ref ("");
const error = ref ("");

function listQuery () {
    return { q: q.value, guard: guard.value, order: order.value, currentPage: page.value, };
}

async function load (): Promise<void> {
    const query = adminListRouteQuery ({
        q: q.value,
        guard: guard.value,
        order: order.value,
        page: String (page.value),
    }, listDefaults);

    if (JSON.stringify (query) !== JSON.stringify (adminListRouteQuery (readAdminListRoute (route.query, listDefaults), listDefaults))) {
        void router.replace ({ query, });
    }

    isLoading.value = true;
    const result = await fetchRoles (listQuery ());

    isLoading.value = false;

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    applyPaginatedResult (result, items, meta);
}

async function runJob (action: () => Promise<{ isSuccess: boolean; data: unknown; error: unknown; }>): Promise<void> {
    message.value = "";
    error.value = "";
    const result = await action ();

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    message.value = typeof result.data === "string" ? result.data : t ("job_started");
    await load ();
}

function confirmDelete (id: string): void {
    confirmId.value = id;
    confirmOpen.value = true;
}

function clearFilters (): void {
    guard.value = "";
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
    <AdminFrame v-if="canRender" :title="t ('roles')" :description="t ('roles_description')" :refresh-scopes="['roles']" @refresh="load">
        <template #actions>
            <FbButton v-if="can ('role.import')" variant="tertiary" size="xs" type="button" @click="importOpen = true">{{ t ("import_file") }}</FbButton>
            <FbButton v-if="can ('role.export')" variant="secondary" size="xs" type="button" @click="exportOpen = true">{{ t ("export") }}</FbButton>
            <FbButton v-if="can ('role.create')" size="xs" to="/admin/roles/create">{{ t ("roles_create") }}</FbButton>
        </template>
        <AlertSuccess :message="message" />
        <AlertError :message="error" />
        <div :class="fbAdminIndexShell">
        <div :class="fbAdminIndexToolbar">
            <div class="min-w-0 max-w-xl flex-1" role="search">
                <label for="roles-search" class="sr-only">{{ t ("search") }}</label>
                <AdminSearchInput id="roles-search" v-model="q" :placeholder="t ('roles_search_placeholder')" @submit="page = 1; load ()" />
            </div>
            <AdminListFilterPanel :open="filterOpen" :active-count="guard ? 1 : 0" @toggle="filterOpen = ! filterOpen" @clear="clearFilters">
                <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{{ t ("roles_column_guard") }}</label>
                <select v-model="guard" :class="fbSelect" @change="page = 1; load ()">
                    <option value="">{{ t ("roles_filter_all") }}</option>
                    <option value="web">web</option>
                    <option value="api">api</option>
                </select>
            </AdminListFilterPanel>
        </div>
        <AdminTableSkeleton v-if="isLoading" :cols="5" />
        <div v-else :class="fbAdminIndexScroll">
            <div v-if="items.length === 0" class="px-6 py-8 text-center">
                <p :class="fbMuted">{{ t ("roles_empty") }}</p>
            </div>
            <table v-else :class="fbAdminTable">
                <thead :class="fbAdminTableHead">
                    <tr>
                        <AdminSortableTableHead :label="t ('name')" field="name" :sort="order" @sort="sortBy" />
                        <AdminSortableTableHead :label="t ('roles_column_guard')" field="guard_name" :sort="order" @sort="sortBy" />
                        <th :class="fbAdminTableHeadCell">{{ t ("permissions") }}</th>
                        <AdminSortableTableHead :label="t ('created_at')" field="created_at" :sort="order" @sort="sortBy" />
                        <th :class="[fbAdminTableHeadCell, fbAdminTableHeadActions,]">{{ t ("actions") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="role in items" :key="role.id" :class="fbAdminTableRow">
                        <td :class="fbAdminTableCellPrimary">
                            <NuxtLink :class="fbLink" :to="`/admin/roles/${role.id}`">{{ role.name }}</NuxtLink>
                            <span v-if="role.is_protected" class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{{ t ("roles_protected_badge") }}</span>
                        </td>
                        <td :class="fbAdminTableCell">{{ role.guard_name }}</td>
                        <td :class="fbAdminTableCell">{{ role.permissions?.length ?? 0 }}</td>
                        <td :class="[fbAdminTableCell, 'whitespace-nowrap',]">{{ formatStamp (role.created_at) }}</td>
                        <td :class="[fbAdminTableCell, fbAdminTableCellActions,]">
                            <div :class="fbAdminTableActions">
                                <AdminRowButton icon="view" :to="`/admin/roles/${role.id}`">{{ t ("view") }}</AdminRowButton>
                                <AdminRowButton v-if="can ('role.update') && ! role.is_protected" icon="edit" :to="`/admin/roles/${role.id}/edit`">{{ t ("edit") }}</AdminRowButton>
                                <AdminRowButton
                                    v-if="can ('role.delete') && ! role.is_protected && ! role.users_count"
                                    icon="delete"
                                    @click="confirmDelete (role.id)">
                                    {{ t ("delete") }}
                                </AdminRowButton>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <AdminPagination :meta="meta" :page="page" @change="page = $event; load ()" />
        </div>
        <AdminConfirmModal
            :open="confirmOpen"
            title-id="roles-confirm-title"
            :title="t ('confirm')"
            :message="t ('confirm_delete')"
            :confirm-label="t ('delete')"
            danger
            @update:open="confirmOpen = $event"
            @confirm="confirmOpen = false; runJob (() => destroy (confirmId))" />
        <AdminImportModal
            :open="importOpen"
            i18n-prefix="roles"
            accept=".csv,.txt,.xls,.xlsx"
            @update:open="importOpen = $event"
            @sample="downloadRoleImportSample"
            @confirm="importOpen = false; runJob (() => importRoles ($event))" />
        <AdminExportModal
            :open="exportOpen"
            i18n-prefix="roles"
            :formats="exportFormats"
            @update:open="exportOpen = $event"
            @confirm="exportType = $event as AclExportFormat; exportOpen = false; runJob (() => exportRoles (listQuery (), exportType))" />
    </AdminFrame>
</template>
