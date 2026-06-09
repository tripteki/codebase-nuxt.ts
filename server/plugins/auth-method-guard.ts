import { getLocaleFromEvent, getServerTranslation, } from "../utils/i18n";

const postOnlyRoutes = new Set ([
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
]);

export default defineNitroPlugin ((nitroApp) =>
{
    nitroApp.hooks.hook ("request", (event) =>
    {
        const path = getRequestURL (event).pathname;

        if (! postOnlyRoutes.has (path))
        {
            return;
        }

        if (event.method === "POST")
        {
            return;
        }

        const locale = getLocaleFromEvent (event);
        const t = getServerTranslation (locale, "common");

        throw createError ({
            statusCode: 405,
            data: { error: t ("method_not_allowed"), },
        });
    });
});
