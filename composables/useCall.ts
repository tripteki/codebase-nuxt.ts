import { createCall, type CallDetail, type CallResult, } from "@/lib/call";

export function useCall (): {
    call: (detail: CallDetail) => Promise<CallResult>;
}
{
    const { token, data: sessionData, } = useAuth ();
    const config = useRuntimeConfig ();

    const call = createCall (
        () => token.value ?? (sessionData.value as any)?.jwt ?? (sessionData.value as any)?.accessToken ?? "",
        () => String (config.public.baseURL)
    );

    return { call, };
}

export { createCall, };
export type { CallDetail, CallResult, };
