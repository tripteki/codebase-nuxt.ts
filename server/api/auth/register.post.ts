import { parseApiErrors, focusPasswordMatchError, } from "../../../lib/parse-api-errors";
import { validatePasswordConfirmation, } from "../../../lib/auth-response";
import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const body = await readBody (event);
    const { name, email, password, password_confirmation, } = body ?? {};
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();

    const passwordMismatch = validatePasswordConfirmation (
        password,
        password_confirmation,
        t ("password_mismatch")
    );

    if (passwordMismatch)
    {
        throw createError ({
            statusCode: 422,
            data: {
                success: false,
                errors: focusPasswordMatchError (passwordMismatch, "password_confirmation"),
            },
        });
    }

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/register",
        method: "POST",
        data: {
            name,
            email,
            password,
            password_confirmation,
        },
    });

    if (response.isError)
    {
        const axiosError = response.error as any;

        if (axiosError?.response)
        {
            const status = axiosError.response.status || 500;
            const errors = parseApiErrors (axiosError.response.data, t ("registration_failed"));

            throw createError ({
                statusCode: status,
                data: {
                    success: false,
                    errors,
                },
            });
        }

        throw createError ({
            statusCode: 500,
            data: {
                success: false,
                errors: { general: t ("registration_failed"), },
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
        setResponseStatus (event, 201);

        return {
            success: true,
            data: response.data,
        };
    }

    throw createError ({
        statusCode: 500,
        data: {
            success: false,
            errors: { general: t ("registration_failed"), },
        },
    });
});
