import { useAdminCall, } from "@/composables/useAdminCall";
import {
    appendAdminListFilter,
    buildAdminListParams,
} from "@/lib/admin-list-params";
import type { CallResult, } from "@/lib/call";

export function useAdminActivities () {
    const { adminCall, } = useAdminCall ();

    function fetchActivities (query: {
        q?: string;
        subjectType?: string;
        dateFrom?: string;
        dateTo?: string;
        causer?: string;
        order?: string;
        currentPage?: number;
    } = {}): Promise<CallResult> {
        const params = buildAdminListParams ({
            currentPage: query.currentPage,
            limitPage: 15,
            order: query.order || "created_at:desc",
        });

        appendAdminListFilter (params, "q", query.q);
        appendAdminListFilter (params, "subject_type", query.subjectType);
        appendAdminListFilter (params, "date_from", query.dateFrom);
        appendAdminListFilter (params, "date_to", query.dateTo);
        appendAdminListFilter (params, "causer", query.causer);

        return adminCall ({ path: "/activities/", method: "GET", params, });
    }

    function get (id: string): Promise<CallResult> {
        return adminCall ({ path: `/activities/${id}`, method: "GET", });
    }

    return { fetchActivities, get, };
}
