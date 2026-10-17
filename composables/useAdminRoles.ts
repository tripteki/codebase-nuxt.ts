import { useAdminCall, } from "@/composables/useAdminCall";
import {
    appendAdminListFilter,
    buildAdminListParams,
} from "@/lib/admin-list-params";
import type { CallResult, } from "@/lib/call";
import type { AclExportFormat, } from "@/lib/admin-export";
import type { AdminRoleFormPayload, } from "@/types/admin/role";

export type AdminRoleListQuery = {
    q?: string;
    guard?: string;
    order?: string;
    currentPage?: number;
};

export function useAdminRoles () {
    const { adminCall, } = useAdminCall ();

    function listParams (query: AdminRoleListQuery = {}) {
        const params = buildAdminListParams ({
            currentPage: query.currentPage,
            limitPage: 15,
            order: query.order || "name:asc",
        });

        appendAdminListFilter (params, "q", query.q);
        appendAdminListFilter (params, "guard_name", query.guard, ["web", "api"]);

        return params;
    }

    function fetchRoles (query: AdminRoleListQuery = {}): Promise<CallResult> {
        return adminCall ({ path: "/roles/", method: "GET", params: listParams (query), });
    }

    function get (id: string): Promise<CallResult> {
        return adminCall ({ path: `/roles/${id}`, method: "GET", });
    }

    function create (payload: AdminRoleFormPayload): Promise<CallResult> {
        return adminCall ({ path: "/roles/", method: "POST", data: payload, });
    }

    function update (id: string, payload: AdminRoleFormPayload): Promise<CallResult> {
        return adminCall ({ path: `/roles/${id}`, method: "PUT", data: payload, });
    }

    function destroy (id: string): Promise<CallResult> {
        return adminCall ({ path: `/roles/${id}`, method: "DELETE", });
    }

    function importRoles (file: File): Promise<CallResult> {
        const formData = new FormData ();

        formData.append ("file", file);

        return adminCall ({ path: "/roles/import", method: "POST", data: formData, });
    }

    function exportRoles (query: AdminRoleListQuery = {}, exportType: AclExportFormat = "csv"): Promise<CallResult> {
        return adminCall ({
            path: "/roles/export",
            method: "POST",
            params: { export_type: exportType, ...listParams (query), },
        });
    }

    return { fetchRoles, get, create, update, destroy, importRoles, exportRoles, };
}
