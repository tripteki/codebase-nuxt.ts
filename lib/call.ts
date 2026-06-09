import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, } from "axios";

type Detail =
{
    baseUrl?: string;
    url: string;
    headers?: Record<string, any>;
    method?: "GET" | "DELETE" | "POST" | "PUT" | "PATCH";
    data?: Record<string, any>;
    params?: Record<string, any>;
};

export type CallDetail = Detail;

export type CallResult = {
    isLoading: boolean;
    isLoaded: boolean;
    isError: boolean;
    isSuccess: boolean;
    data: any;
    error: any;
};

export const createCall = (
    getToken: () => string | null | undefined,
    getBaseURL: () => string
) => async (
    detail: Detail
): Promise<CallResult> =>
{
    const baseURL: string = String (detail?.baseUrl ?? getBaseURL ());

    let isLoading: boolean = true;
    let isLoaded: boolean = false;
    let isError: boolean = false;
    let isSuccess: boolean = false;
    let data: any = null;
    let error: any = null;

    try
    {
        const accessToken = getToken () ?? "";

        const instance: AxiosInstance = axios.create ({
            baseURL,
            headers: {
                ... (accessToken ? { Authorization: `Bearer ${accessToken}`, } : {}),
                ... (detail.headers || {}),
            },
        });

        const requestConfig: AxiosRequestConfig = {
            method: detail.method || "GET",
            url: detail.url,
            ... (detail.data ? { data: detail.data, } : {}),
            ... (detail.params ? { params: detail.params, } : {}),
        };

        const response: AxiosResponse = await instance.request (requestConfig);

        data = response.data;
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
