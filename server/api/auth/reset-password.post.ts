import { parseApiErrors, focusPasswordMatchError, } from "../../../lib/parse-api-errors";
import { buildResetPasswordRequest, } from "../../../lib/auth-reset-password-request";
import { validatePasswordConfirmation, } from "../../../lib/auth-response";
import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const body = await readBody (event);
    const { email, signed, token, password, password_confirmation, } = body ?? {};
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
                errors: focusPasswordMatchError (passwordMismatch, "password"),
            },
        });
    }

    const resetRequest = buildResetPasswordRequest ({
        email: String (email),
        token: token ? String (token) : undefined,
        signed: signed ? String (signed) : undefined,
        password: String (password ?? ""),
        password_confirmation: String (password_confirmation ?? ""),
    });

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: resetRequest.url,
        method: "POST",
        data: resetRequest.data,
        ... (resetRequest.params ? { params: resetRequest.params, } : {}),
    });

    if (response.isError)
    {
        const axiosError = response.error as any;

        if (axiosError?.response)
        {
            const status = axiosError.response.status || 500;
            const errors = parseApiErrors (
                axiosError.response.data,
                t ("failed_to_reset_password")
            );

            throw createError ({
                statusCode: status,
                data: { success: false, errors, },
            });
        }

        throw createError ({
            statusCode: 500,
            data: {
                success: false,
                errors: { general: t ("failed_to_reset_password"), },
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
            message: response.data?.message || t ("password_reset_successfully"),
        };
    }

    throw createError ({
        statusCode: 500,
        data: {
            success: false,
            errors: { general: t ("failed_to_reset_password"), },
        },
    });
});
