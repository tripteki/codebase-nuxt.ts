import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) => {
    const authorization = getHeader (event, "authorization");
    const token = authorization?.replace (/^Bearer\s+/i, "");
    const body = await readBody (event);
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "common");
    const config = useRuntimeConfig ();

    if (! token) {
        throw createError ({
            statusCode: 401,
            data: {
                errors: { general: t ("something_went_wrong") },
            },
        });
    }

    const response = await callServer (
        {
            baseUrl: config.public.baseURL as string,
            url: "/v1/webpush/unsubscribe",
            method: "POST",
            data: body,
        },
        token
    );

    if (response.isError) {
        const axiosError = response.error as any;
        const status = axiosError?.response?.status || 500;

        throw createError ({
            statusCode: status,
            data: {
                errors: { general: t ("something_went_wrong") },
            },
        });
    }

    return response.data ?? { success: true };
});
