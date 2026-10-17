import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();
    const body = await readBody (event);
    const email = typeof body?.email === "string" ? body.email.trim () : "";

    if (! email)
    {
        throw createError ({
            statusCode: 422,
            data: {
                errors: { email: t ("authentication_failed"), },
            },
        });
    }

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/resend-verification",
        method: "POST",
        data: { email, },
    });

    if (response.isError)
    {
        const axiosError = response.error as { response?: { status?: number; }; };
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
