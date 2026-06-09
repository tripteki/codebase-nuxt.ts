import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const body = await readBody (event);
    const { email, } = body ?? {};
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/forgot-password",
        method: "POST",
        data: { email, },
    });

    if (response.isError)
    {
        const axiosError = response.error as any;

        if (axiosError?.response)
        {
            const status = axiosError.response.status || 500;
            let errors: Record<string, string> = {};

            if (axiosError.response.data?.errors)
            {
                errors = axiosError.response.data.errors;
            }
            else if (axiosError.response.data?.message)
            {
                errors.general = axiosError.response.data.message;
            }
            else if (typeof axiosError.response.data === "string")
            {
                errors.general = axiosError.response.data;
            }
            else
            {
                errors.general = t ("failed_to_send_reset_link");
            }

            throw createError ({
                statusCode: status,
                data: { success: false, errors, },
            });
        }

        throw createError ({
            statusCode: 500,
            data: {
                success: false,
                errors: { general: t ("failed_to_send_reset_link"), },
            },
        });
    }

    if (typeof response.data === "string")
    {
        throw createError ({
            statusCode: 422,
            data: {
                success: false,
                errors: { general: response.data, },
            },
        });
    }

    if (response.data?.errors)
    {
        throw createError ({
            statusCode: 422,
            data: {
                success: false,
                errors: response.data.errors,
            },
        });
    }

    if (response.data && typeof response.data === "object")
    {
        return {
            success: true,
            message: response.data?.message || t ("password_reset_link_sent"),
        };
    }

    throw createError ({
        statusCode: 500,
        data: {
            success: false,
            errors: { general: t ("failed_to_send_reset_link"), },
        },
    });
});
