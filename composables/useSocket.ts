import {
    createRealtimeClient,
    type RealtimeClient,
} from "@/lib/realtime-client";
import type { RealtimeConnectionConfig } from "@/lib/realtime-config";

export const useSocket = async (
    detail?: Partial<RealtimeConnectionConfig>
): Promise<{
    isLoading: boolean;
    isLoaded: boolean;
    isError: boolean;
    isSuccess: boolean;
    data: RealtimeClient | null;
    error: any;
}> => {
    let isLoading: boolean = true;
    let isLoaded: boolean = false;
    let isError: boolean = false;
    let isSuccess: boolean = false;
    let data: RealtimeClient | null = null;
    let error: any = null;

    try {
        const { token, data: sessionData, } = useAuth ();
        const accessToken: string =
            token.value ??
            (sessionData.value as any)?.accessToken ??
            (sessionData.value as any)?.jwt ??
            "";

        data = createRealtimeClient (accessToken, detail);
        isSuccess = true;
    } catch (thrower: any) {
        error = thrower;
        isError = true;
    } finally {
        isLoading = false;
        isLoaded = true;
    }

    return {
        isLoading,
        isLoaded,
        isError,
        isSuccess,
        data,
        error,
    };
};
