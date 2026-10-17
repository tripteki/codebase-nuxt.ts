import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, } from "axios";

import { authorizationHeader, } from "@/lib/access-token";

type Detail =
{
    baseUrl?: string;
    url: string;
    headers?: Record<string, any>;
    method?: "GET" | "DELETE" | "POST" | "PUT" | "PATCH";
    data?: Record<string, any>;
    params?: Record<string, any>;
};

export const callServer = async (
    detail: Detail,
    token?: string
): Promise<{
    isLoading: boolean;
    isLoaded: boolean;
    isError: boolean;
    isSuccess: boolean;
    data: any;
    error: any;
}> =>
{
    const config = useRuntimeConfig ();
    const baseURL: string = String (detail?.baseUrl ?? config.public.baseURL);

    let isLoading: boolean = true;
    let isLoaded: boolean = false;
    let isError: boolean = false;
    let isSuccess: boolean = false;
    let data: any = null;
    let error: any = null;

    try
    {
        const authorization = authorizationHeader (token);

        const instance: AxiosInstance = axios.create ({
            baseURL,
            headers: {
                "Content-Type": "application/json",
                ... (authorization ? { Authorization: authorization, } : {}),
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
