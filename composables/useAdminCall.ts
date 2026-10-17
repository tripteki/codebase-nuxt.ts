import {
    useCall,
    type CallDetail,
    type CallResult,
} from "@/composables/useCall";

type AdminCallDetail = Omit<CallDetail, "url"> & {
    path: string;
};

export function adminApiPath (path: string): string {
    const normalized = path.startsWith ("/") ? path : `/${path}`;

    return `/api/v1/admin${normalized}`;
}

export function useAdminCall (): {
    adminCall: (detail: AdminCallDetail) => Promise<CallResult>;
} {
    const { call, } = useCall ();

    async function adminCall (detail: AdminCallDetail): Promise<CallResult> {
        const { path, ...rest } = detail;

        return call ({
            ...rest,
            url: adminApiPath (path),
        });
    }

    return { adminCall, };
}
