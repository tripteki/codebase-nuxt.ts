import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const body = await readBody (event).catch (() => ({}));
    const authorization = getHeader (event, "authorization");
    const refreshToken = body?.refreshToken
        ?? authorization?.replace (/^Bearer\s+/i, "");
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();

    if (! refreshToken)
    {
        throw createError ({
            statusCode: 401,
            data: {
                errors: { general: t ("authentication_failed"), },
            },
        });
    }

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/refresh",
        method: "PUT",
    }, refreshToken);

    if (response.isError)
    {
        const axiosError = response.error as any;
        const status = axiosError?.response?.status || 401;

        throw createError ({
            statusCode: status,
            data: {
                errors: { general: t ("authentication_failed"), },
            },
        });
    }

    return response.data;
});
