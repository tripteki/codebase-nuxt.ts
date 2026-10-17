import { useAdminCall, } from "@/composables/useAdminCall";
import {
    appendAdminListFilter,
    buildAdminListParams,
} from "@/lib/admin-list-params";
import type { CallResult, } from "@/lib/call";
import type { AclExportFormat, } from "@/lib/admin-export";
import type { AdminPermissionFormPayload, } from "@/types/admin/permission";

export type AdminPermissionListQuery = {
    q?: string;
    guard?: string;
    order?: string;
    currentPage?: number;
    limitPage?: number;
};

export function useAdminPermissions () {
    const { adminCall, } = useAdminCall ();

    function listParams (query: AdminPermissionListQuery = {}) {
        const params = buildAdminListParams ({
            currentPage: query.currentPage,
            limitPage: query.limitPage ?? 15,
            order: query.order || "name:asc",
        });

        appendAdminListFilter (params, "q", query.q);
        appendAdminListFilter (params, "guard_name", query.guard, ["web", "api"]);

        return params;
    }

    function fetchPermissions (query: AdminPermissionListQuery = {}): Promise<CallResult> {
        return adminCall ({
            path: "/permissions/",
            method: "GET",
            params: listParams (query),
        });
    }

    function get (id: string): Promise<CallResult> {
        return adminCall ({ path: `/permissions/${id}`, method: "GET", });
    }

    function create (payload: AdminPermissionFormPayload): Promise<CallResult> {
        return adminCall ({ path: "/permissions/", method: "POST", data: payload, });
    }

    function update (id: string, payload: AdminPermissionFormPayload): Promise<CallResult> {
        return adminCall ({ path: `/permissions/${id}`, method: "PUT", data: payload, });
    }

    function destroy (id: string): Promise<CallResult> {
        return adminCall ({ path: `/permissions/${id}`, method: "DELETE", });
    }

    function importPermissions (file: File): Promise<CallResult> {
        const formData = new FormData ();

        formData.append ("file", file);

        return adminCall ({ path: "/permissions/import", method: "POST", data: formData, });
    }

    function exportPermissions (query: AdminPermissionListQuery = {}, exportType: AclExportFormat = "csv"): Promise<CallResult> {
        return adminCall ({
            path: "/permissions/export",
            method: "POST",
            params: { export_type: exportType, ...listParams (query), },
        });
    }

    return {
        fetchPermissions,
        get,
        create,
        update,
        destroy,
        importPermissions,
        exportPermissions,
    };
}
