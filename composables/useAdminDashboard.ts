import { useAdminCall, } from "@/composables/useAdminCall";
import type { CallResult, } from "@/lib/call";

export function useAdminDashboard () {
    const { adminCall, } = useAdminCall ();

    function fetchDashboard (period = "30d"): Promise<CallResult> {
        return adminCall ({
            path: "/dashboard/",
            method: "GET",
            params: { period, },
        });
    }

    return { fetchDashboard, };
}
