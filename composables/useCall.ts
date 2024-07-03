"use strict";

import axios from "axios";

export default async (detail: Object = {}): Promise<any> =>
{
    const

    { token, getSession, } = useAuth (),
    configuration = useRuntimeConfig (),
    user = await getSession ();

    const instance = axios.create (
    {
        baseURL: configuration.public.baseURL as string,

        headers: {

            ... (token.value ? { "Authorization": "Bearer " + token.value, } : {}),
        },
    });

    instance.interceptors.request.use (

        async request => request,
        async error => Promise.reject (error)
    );

    instance.interceptors.response.use (

        async response => response,
        async error => Promise.reject (error)
    );

    var isLoading = false;
    var isLoaded = false;
    var isError = false;
    var isSuccess = false;
    var data = {};
    var error = {};

    await instance (detail)
    .then (response =>
    {
        isLoading = true;
        isSuccess = true;
        data = response;
    })
    .catch (throwable =>
    {
        isLoading = true;
        isError = true;
        error = throwable;
    })
    .finally (() =>
    {
        isLoading = false;
        isLoaded = true;
    });

    return {

        isLoading,
        isLoaded,
        isError,
        isSuccess,
        data,
        error,
    };
};
