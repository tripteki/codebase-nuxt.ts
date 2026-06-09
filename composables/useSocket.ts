import Echo from "laravel-echo";

import { createEcho, } from "@/lib/echo";

type Detail =
{
    apiUrl?: string;
    reverbAppKey?: string;
    reverbHost?: string;
    reverbPort?: number;
    reverbScheme?: string;
};

export const useSocket = async (
    detail?: Detail
): Promise<{
    isLoading: boolean;
    isLoaded: boolean;
    isError: boolean;
    isSuccess: boolean;
    data: Echo<any> | null;
    error: any;
}> =>
{
    let isLoading: boolean = true;
    let isLoaded: boolean = false;
    let isError: boolean = false;
    let isSuccess: boolean = false;
    let data: Echo<any> | null = null;
    let error: any = null;

    try
    {
        const { token, data: sessionData, } = useAuth ();
        const accessToken: string = token.value
            ?? (sessionData.value as any)?.accessToken
            ?? (sessionData.value as any)?.jwt
            ?? "";

        data = createEcho (accessToken, detail);
        isSuccess = true;
    }
    catch (thrower: any)
    {
        error = thrower;
        isError = true;
    }
    finally
    {
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
