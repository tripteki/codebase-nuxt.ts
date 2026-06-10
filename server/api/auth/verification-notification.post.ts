import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const authorization = getHeader (event, "authorization");
    const token = authorization?.replace (/^Bearer\s+/i, "");
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();

    if (! token)
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
        url: "/email/verification-notification",
        method: "POST",
    }, token);

    if (response.isError)
    {
        const axiosError = response.error as any;
        const status = axiosError?.response?.status || 500;

        throw createError ({
            statusCode: status,
            data: {
                errors: { general: t ("something_went_wrong"), },
            },
        });
    }

    return {
        message: typeof response.data === "string"
            ? response.data
            : t ("verification-sent"),
    };
});
