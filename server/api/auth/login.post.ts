import { parseApiErrors, focusPasswordMatchError, } from "../../../lib/parse-api-errors";
import { buildAuthLoginPayload, } from "../../../lib/auth-login-payload";
import { isAuthTokenResponse, parseAuthLoginFailure, validatePasswordConfirmation, } from "../../../lib/auth-response";
import { callServer, } from "../../utils/call-server";
import { getLocaleFromEvent, getServerTranslation, } from "../../utils/i18n";

export default defineEventHandler (async (event) =>
{
    const body = await readBody (event);
    const { identifier, password, remember, } = body ?? {};
    const locale = getLocaleFromEvent (event);
    const t = getServerTranslation (locale, "auth");
    const config = useRuntimeConfig ();

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/login",
        method: "POST",
        data: buildAuthLoginPayload ({
            identifier: String (identifier ?? ""),
            password: String (password ?? ""),
            remember: Boolean (remember),
        }),
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

    const loginFailure = parseAuthLoginFailure (
        response.data,
        t ("authentication_failed")
    );

    if (loginFailure)
    {
        throw createError ({
            statusCode: 401,
            data: { errors: loginFailure, },
        });
    }

    if (! isAuthTokenResponse (response.data))
    {
        throw createError ({
            statusCode: 401,
            data: {
                errors: { general: t ("authentication_failed"), },
            },
        });
    }

    const accessToken = response.data.accessToken;
    const refreshToken = response.data.refreshToken;

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
        id: userResponse.data?.id,
        user: userResponse.data,
    };
});
