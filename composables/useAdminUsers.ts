import { useAdminCall, } from "@/composables/useAdminCall";
import {
    appendAdminListFilter,
    buildAdminListParams,
} from "@/lib/admin-list-params";
import type { CallResult, } from "@/lib/call";
import type { UserExportFormat, } from "@/lib/admin-export";
import { buildAdminUserBody, type AdminUserFormPayload, } from "@/types/admin/user";

export type AdminUserListQuery = {
    q?: string;
    role?: string;
    status?: string;
    order?: string;
    currentPage?: number;
    limitPage?: number;
};

export function useAdminUsers () {
    const { adminCall, } = useAdminCall ();

    function listParams (query: AdminUserListQuery): Record<string, string | number> {
        const params = buildAdminListParams ({
            currentPage: query.currentPage,
            limitPage: query.limitPage ?? 15,
            order: query.order || "created_at:desc",
        });

        appendAdminListFilter (params, "q", query.q);
        appendAdminListFilter (params, "role", query.role);
        appendAdminListFilter (params, "status", query.status, [
            "active",
            "unverified",
            "deactivated",
            "all",
        ]);

        return params;
    }

    function fetchUsers (query: AdminUserListQuery = {}): Promise<CallResult> {
        return adminCall ({
            path: "/users/",
            method: "GET",
            params: listParams (query),
        });
    }

    function get (id: string): Promise<CallResult> {
        return adminCall ({ path: `/users/${id}`, method: "GET", });
    }

    function create (payload: AdminUserFormPayload, avatar?: File | null): Promise<CallResult> {
        return adminCall ({
            path: "/users/",
            method: "POST",
            data: buildAdminUserBody (payload, avatar),
        });
    }

    function update (id: string, payload: AdminUserFormPayload, avatar?: File | null): Promise<CallResult> {
        const data = avatar
            ? buildAdminUserBody (payload, avatar)
            : {
                name: payload.name,
                full_name: payload.full_name,
                email: payload.email,
                role: payload.role,
                ...(payload.password
                    ? {
                        password: payload.password,
                        password_confirmation: payload.password_confirmation,
                    }
                    : {}),
            };

        return adminCall ({
            path: `/users/${id}`,
            method: "PUT",
            data,
        });
    }

    function verify (id: string): Promise<CallResult> {
        return adminCall ({ path: `/users/verify/${id}`, method: "PUT", });
    }

    function activate (id: string): Promise<CallResult> {
        return adminCall ({ path: `/users/activate/${id}`, method: "DELETE", });
    }

    function deactivate (id: string): Promise<CallResult> {
        return adminCall ({ path: `/users/deactivate/${id}`, method: "DELETE", });
    }

    function forceDelete (id: string): Promise<CallResult> {
        return adminCall ({ path: `/users/force-delete/${id}`, method: "DELETE", });
    }

    function importUsers (file: File): Promise<CallResult> {
        const formData = new FormData ();

        formData.append ("file", file);

        return adminCall ({
            path: "/users/import",
            method: "POST",
            data: formData,
        });
    }

    function exportUsers (query: AdminUserListQuery = {}, exportType: UserExportFormat = "csv"): Promise<CallResult> {
        return adminCall ({
            path: "/users/export",
            method: "POST",
            params: {
                export_type: exportType,
                ...listParams (query),
            },
        });
    }

    return {
        fetchUsers,
        get,
        create,
        update,
        verify,
        activate,
        deactivate,
        forceDelete,
        importUsers,
        exportUsers,
    };
}
