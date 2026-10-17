<script setup lang="ts">
import { computed, onMounted, ref, } from "vue";
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
import AdminStatusDot from "@/components/admin/AdminStatusDot.vue";
import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminUsers, } from "@/composables/useAdminUsers";
import type { UserExportFormat, } from "@/lib/admin-export";
import { useRequireAuth, } from "@/composables/useAuthGuard";
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
    fbLink,
    fbMuted,
    fbSelect,
} from "@/lib/flowbite-classes";
import { downloadUserImportSample, } from "@/lib/samples/users";
import { userRoleValues, } from "@/lib/user-role";
import { resolveSessionUserId, } from "@/lib/session-user";
import {
    canMutateAdminAccount,
    resolveUserAccountStatus,
    resolveUserDisplayName,
    userStatusTone,
    type AdminUser,
} from "@/types/admin/user";

definePageAuthed ();

const exportFormats: UserExportFormat[] = ["csv", "xlsx", "xls"];
const { canRender, } = useRequireAuth ();
const { data: sessionData, } = useAuth ();
const { t, } = useTranslation ("common");
const { can, isSuperadmin, } = useAdminAccesses ();
const { fetchUsers, verify, activate, deactivate, forceDelete, importUsers, exportUsers, } = useAdminUsers ();
const { items, meta, isLoading, } = useAdminListState<AdminUser> ("admin-users");
const route = useRoute ();
const router = useRouter ();
const listDefaults = { q: "", role: "", status: "active", order: "created_at:desc", page: "1", };
const roleOptions = userRoleValues ();
const initialList = readAdminListRoute (route.query, listDefaults);
const q = ref (initialList.q);
const role = ref (initialList.role);
const status = ref (initialList.status);
const filterOpen = ref (false);
const activeFilterCount = computed (() => (role.value ? 1 : 0) + (status.value !== "active" ? 1 : 0));
const order = ref (initialList.order);
const exportType = ref<UserExportFormat> ("csv");
const importOpen = ref (false);
const exportOpen = ref (false);
const confirmOpen = ref (false);
const confirmDanger = ref (false);
const confirmMessage = ref ("");
const confirmAction = ref<(() => Promise<{ isSuccess: boolean; data: unknown; error: unknown; }>) | null> (null);
const page = ref (Number (initialList.page) || 1);
const message = ref ("");
const error = ref ("");
const selfId = computed (() => resolveSessionUserId (sessionData.value));

function listQuery () {
    return {
        q: q.value,
        role: role.value,
        status: status.value,
        order: order.value,
        currentPage: page.value,
    };
}

function canChange (user: AdminUser): boolean {
    return canMutateAdminAccount (selfId.value, isSuperadmin.value, user);
}

function roleLabel (key: string): string {
    const translated = t (`role_${key}`);

    if (translated === `role_${key}` || translated.endsWith (`.role_${key}`)) {
        return key;
    }

    return translated;
}

async function load (): Promise<void> {
    const query = adminListRouteQuery ({
        q: q.value,
        role: role.value,
        status: status.value,
        order: order.value,
        page: String (page.value),
    }, listDefaults);

    if (JSON.stringify (query) !== JSON.stringify (adminListRouteQuery (readAdminListRoute (route.query, listDefaults), listDefaults))) {
        void router.replace ({ query, });
    }

    isLoading.value = true;
    error.value = "";
    const result = await fetchUsers (listQuery ());

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

function confirmJob (prompt: string, action: () => Promise<{ isSuccess: boolean; data: unknown; error: unknown; }>, danger = false): void {
    confirmMessage.value = prompt;
    confirmDanger.value = danger;
    confirmAction.value = action;
    confirmOpen.value = true;
}

async function runConfirm (): Promise<void> {
    const action = confirmAction.value;

    confirmOpen.value = false;

    if (action) {
        await runJob (action);
    }
}

function clearFilters (): void {
    q.value = "";
    role.value = "";
    status.value = "active";
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
    <AdminFrame
        v-if="canRender"
        :title="t ('all_users')"
        :description="t ('users_index_description')"
        :refresh-scopes="['users']"
        @refresh="load">
        <template #actions>
            <FbButton v-if="can ('user.import')" variant="tertiary" size="xs" type="button" @click="importOpen = true">{{ t ("import_file") }}</FbButton>
            <FbButton v-if="can ('user.export')" variant="secondary" size="xs" type="button" @click="exportOpen = true">{{ t ("export") }}</FbButton>
            <FbButton v-if="can ('user.create')" size="xs" to="/admin/users/create">{{ t ("users_create") }}</FbButton>
        </template>
        <AlertSuccess :message="message" />
        <AlertError :message="error" />

        <div :class="fbAdminIndexShell">
        <div :class="fbAdminIndexToolbar">
            <div class="min-w-0 max-w-xl flex-1" role="search">
                <label for="users-search" class="sr-only">{{ t ("search") }}</label>
                <AdminSearchInput id="users-search" v-model="q" :placeholder="t ('users_search_placeholder')" @submit="page = 1; load ()" />
            </div>
            <AdminListFilterPanel :open="filterOpen" :active-count="activeFilterCount" @toggle="filterOpen = ! filterOpen" @clear="clearFilters">
                <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{{ t ("role") }}</label>
                <select v-model="role" :class="fbSelect" @change="page = 1; load ()">
                    <option value="">{{ t ("users_filter_role_all") }}</option>
                    <option v-for="item in roleOptions" :key="item" :value="item">{{ roleLabel (item) }}</option>
                </select>
                <label class="mb-2 mt-4 block text-sm font-medium text-gray-900 dark:text-white">{{ t ("status") }}</label>
                <select v-model="status" :class="fbSelect" @change="page = 1; load ()">
                    <option value="active">{{ t ("status_active") }}</option>
                    <option value="unverified">{{ t ("status_unverified") }}</option>
                    <option value="deactivated">{{ t ("status_deactivated") }}</option>
                    <option value="all">{{ t ("all") }}</option>
                </select>
            </AdminListFilterPanel>
        </div>

        <AdminTableSkeleton v-if="isLoading" :cols="5" />
        <div v-else :class="fbAdminIndexScroll">
            <div v-if="items.length === 0" class="px-6 py-8 text-center">
                <p :class="fbMuted">{{ t ("users_empty") }}</p>
            </div>
            <table v-else :class="fbAdminTable">
                <thead :class="fbAdminTableHead">
                    <tr>
                        <th :class="fbAdminTableHeadCell">{{ t ("full_name") }}</th>
                        <th :class="[fbAdminTableHeadCell, 'hidden xl:table-cell',]">{{ t ("role") }}</th>
                        <AdminSortableTableHead class="hidden whitespace-nowrap xl:table-cell" :label="t ('created_at')" field="created_at" :sort="order" @sort="sortBy" />
                        <AdminSortableTableHead class="hidden whitespace-nowrap md:table-cell" :label="t ('status')" field="status" :sort="order" @sort="sortBy" />
                        <th :class="[fbAdminTableHeadCell, fbAdminTableHeadActions,]">{{ t ("actions") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in items" :key="user.id" :class="fbAdminTableRow">
                        <td :class="[fbAdminTableCellPrimary, 'max-w-[18rem] overflow-hidden',]">
                            <span class="flex w-full min-w-0 items-center">
                                <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    <img v-if="user.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover">
                                    <span v-else>{{ resolveUserDisplayName (user).slice (0, 2).toUpperCase () }}</span>
                                </span>
                                <span class="ml-3 w-[6rem] min-w-0 max-w-[6rem] sm:ml-4 sm:w-[10rem] sm:max-w-[10rem]">
                                    <NuxtLink :class="[fbLink, 'block truncate text-sm',]" :to="`/admin/users/${user.id}`">{{ resolveUserDisplayName (user) }}</NuxtLink>
                                    <span class="block truncate text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</span>
                                    <span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 xl:hidden">
                                        <span v-if="user.role" class="badge-brand-primary inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-xs font-medium">{{ roleLabel (user.role) }}</span>
                                        <AdminStatusDot class="text-xs md:hidden" :tone="userStatusTone (resolveUserAccountStatus (user))">
                                            {{ t (`status_${resolveUserAccountStatus (user)}`) }}
                                        </AdminStatusDot>
                                    </span>
                                </span>
                            </span>
                        </td>
                        <td :class="[fbAdminTableCell, 'hidden whitespace-nowrap xl:table-cell',]">
                            <span v-if="user.role" class="badge-brand-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">{{ roleLabel (user.role) }}</span>
                            <span v-else>-</span>
                        </td>
                        <td :class="[fbAdminTableCell, 'hidden whitespace-nowrap xl:table-cell',]">{{ formatStamp (user.created_at) }}</td>
                        <td :class="[fbAdminTableCell, 'hidden whitespace-nowrap md:table-cell',]">
                            <AdminStatusDot :tone="userStatusTone (resolveUserAccountStatus (user))">
                                {{ t (`status_${resolveUserAccountStatus (user)}`) }}
                            </AdminStatusDot>
                        </td>
                        <td :class="[fbAdminTableCell, fbAdminTableCellActions,]">
                            <div :class="fbAdminTableActions">
                                <AdminRowButton icon="view" :to="`/admin/users/${user.id}`">{{ t ("view") }}</AdminRowButton>
                                <AdminRowButton v-if="can ('user.update') && canChange (user)" icon="edit" :to="`/admin/users/${user.id}/edit`">{{ t ("edit") }}</AdminRowButton>
                                <AdminRowButton
                                    v-if="can ('user.update') && canChange (user) && ! user.deleted_at && ! user.email_verified_at"
                                    icon="verify"
                                    @click="confirmJob (t ('confirm_verify'), () => verify (user.id))">
                                    {{ t ("verify") }}
                                </AdminRowButton>
                                <AdminRowButton
                                    v-if="user.deleted_at && can ('user.restore') && canChange (user)"
                                    icon="activate"
                                    @click="confirmJob (t ('confirm_activate'), () => activate (user.id))">
                                    {{ t ("activate") }}
                                </AdminRowButton>
                                <AdminRowButton
                                    v-else-if="! user.deleted_at && can ('user.delete') && canChange (user)"
                                    icon="deactivate"
                                    @click="confirmJob (t ('confirm_deactivate'), () => deactivate (user.id), true)">
                                    {{ t ("deactivate") }}
                                </AdminRowButton>
                                <AdminRowButton
                                    v-if="can ('user.delete') && canChange (user)"
                                    icon="delete"
                                    @click="confirmJob (t ('confirm_force_delete'), () => forceDelete (user.id), true)">
                                    {{ t ("force_delete") }}
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
            title-id="users-confirm-title"
            :title="t ('confirm')"
            :message="confirmMessage"
            :confirm-label="t ('confirm')"
            :danger="confirmDanger"
            @update:open="confirmOpen = $event"
            @confirm="runConfirm" />
        <AdminImportModal
            :open="importOpen"
            i18n-prefix="users"
            accept=".csv,.txt,.xls,.xlsx"
            @update:open="importOpen = $event"
            @sample="downloadUserImportSample"
            @confirm="importOpen = false; runJob (() => importUsers ($event))" />
        <AdminExportModal
            :open="exportOpen"
            i18n-prefix="users"
            :formats="exportFormats"
            @update:open="exportOpen = $event"
            @confirm="exportType = $event as UserExportFormat; exportOpen = false; runJob (() => exportUsers (listQuery (), exportType))" />
    </AdminFrame>
</template>
