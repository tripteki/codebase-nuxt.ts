import { useAdminCall, } from "@/composables/useAdminCall";
import type { CallResult, } from "@/lib/call";

export function useAdminSearch () {
    const { adminCall, } = useAdminCall ();

    function search (q: string, category = "all"): Promise<CallResult> {
        return adminCall ({
            path: "/search/",
            method: "GET",
            params: { q, category, },
        });
    }

    return { search, };
}
