import { parseApiErrors, } from "../../../lib/parse-api-errors";
import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const body = await readBody (event);
    const { identifier, password, } = body ?? {};
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test (identifier ?? "");

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/login",
        method: "POST",
        data: {
            identifierKey: isEmail ? "email" : "username",
            identifierValue: identifier,
            password,
        },
    });

    if (response.isError)
    {
        const axiosError = response.error as any;
        const status = axiosError?.response?.status || 401;
        const errors = parseApiErrors (
            axiosError?.response?.data,
            t ("authentication_failed")
        );

        throw createError ({
            statusCode: status,
            data: { errors, },
        });
    }

    const accessToken = response.data?.accessToken;
    const refreshToken = response.data?.refreshToken;

    if (! accessToken)
    {
        throw createError ({
            statusCode: 401,
            data: {
                errors: { general: t ("authentication_failed"), },
            },
        });
    }

    const userResponse = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/me",
        method: "GET",
    }, accessToken);

    if (userResponse.isError)
    {
        throw createError ({
            statusCode: 401,
            data: {
                errors: { general: t ("authentication_failed"), },
            },
        });
    }

    return {
        accessToken,
        refreshToken,
        jwt: accessToken,
        user: userResponse.data,
    };
});
