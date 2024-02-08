"use strict";

import axios from "axios";

export default () =>
{
    const configuration = useRuntimeConfig ();

    const instance = axios.create (
    {
        baseURL: configuration.public.baseURL,
    });

    instance.interceptors.request.use (
        request => request,
        error => Promise.reject (error)
    );

    instance.interceptors.response.use (
        response => response,
        error => Promise.reject (error)
    );

    return instance;
};
