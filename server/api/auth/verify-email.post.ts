import { parseApiErrors, } from "../../../lib/parse-api-errors";
import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const body = await readBody (event);
    const { email, signed, } = body ?? {};
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();

    if (! email)
    {
        throw createError ({
            statusCode: 400,
            data: {
                success: false,
                errors: { email: t ("email_required"), },
            },
        });
    }

    if (! signed)
    {
        throw createError ({
            statusCode: 400,
            data: {
                success: false,
                errors: { signed: t ("signed_required"), },
            },
        });
    }

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: `/verify-email/${encodeURIComponent (email)}`,
        method: "POST",
        data: {},
        params: { signed, },
    });

    if (response.isError)
    {
        const axiosError = response.error as any;

        if (axiosError?.response)
        {
            const status = axiosError.response.status || 500;
            const errors = parseApiErrors (
                axiosError.response.data,
                status === 403 ? t ("not_signed") : t ("verification_failed")
            );

            throw createError ({
                statusCode: status,
                data: { success: false, errors, },
            });
        }

        let errorMessage = t ("verification_failed");

        if (axiosError?.code === "ENOTFOUND" || axiosError?.code === "ECONNREFUSED")
        {
            errorMessage = t ("backend_unavailable");
        }
        else if (axiosError?.message && ! axiosError.message.includes ("Cannot"))
        {
            errorMessage = axiosError.message;
        }

        throw createError ({
            statusCode: 500,
            data: {
                success: false,
                message: errorMessage,
                errors: {},
            },
        });
    }

    if (typeof response.data === "string")
    {
        throw createError ({
            statusCode: 422,
            data: {
                success: false,
                message: response.data,
                errors: {},
            },
        });
    }

    if (response.data?.errors)
    {
        throw createError ({
            statusCode: 422,
            data: {
                success: false,
                message: response.data.message || t ("verification_failed"),
                errors: response.data.errors,
            },
        });
    }

    if (response.data && typeof response.data === "object")
    {
        return {
            success: true,
            message: response.data?.message || t ("email_verified"),
        };
    }

    throw createError ({
        statusCode: 500,
        data: {
            success: false,
            message: t ("verification_failed"),
            errors: {},
        },
    });
});
