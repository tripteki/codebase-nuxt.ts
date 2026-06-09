type AuthPageMetaOptions = {
    unauthenticatedOnly: boolean;
    navigateAuthenticatedTo: string;
    navigateUnauthenticatedTo?: string;
};

function normalizeUserOptions (userOptions: unknown): AuthPageMetaOptions | undefined
{
    if (typeof userOptions === "boolean" || userOptions === undefined)
    {
        return userOptions !== false
            ? {
                unauthenticatedOnly: false,
                navigateAuthenticatedTo: "/",
                navigateUnauthenticatedTo: undefined,
            }
            : undefined;
    }

    if (typeof userOptions === "object" && userOptions !== null)
    {
        const options = userOptions as {
            unauthenticatedOnly?: boolean;
            navigateAuthenticatedTo?: string;
            navigateUnauthenticatedTo?: string;
        };

        if (options.unauthenticatedOnly === undefined && process.env.NODE_ENV !== "production")
        {
            console.warn (
                "[@sidebase/nuxt-auth] `unauthenticatedOnly` was not provided to `definePageMeta` - defaulting to Guest Mode enabled."
            );
            options.unauthenticatedOnly = true;
        }

        return {
            unauthenticatedOnly: options.unauthenticatedOnly ?? true,
            navigateAuthenticatedTo: options.navigateAuthenticatedTo ?? "/",
            navigateUnauthenticatedTo: options.navigateUnauthenticatedTo,
        };
    }

    return undefined;
}

export default defineNuxtRouteMiddleware (async (to) =>
{
    const { status, getSession, } = useAuth ();

    if (status.value === "loading")
    {
        await getSession ();
    }

    const options = normalizeUserOptions (to.meta.auth);

    if (! options)
    {
        return;
    }

    const authConfig = useRuntimeConfig ().public.auth as {
        provider: {
            pages: { login: string; };
        };
        globalAppMiddleware: boolean | {
            allow404WithoutAuth?: boolean;
            addDefaultCallbackUrl?: boolean | string;
        };
    };
    const isGuestMode = options.unauthenticatedOnly;
    const isAuthenticated = status.value === "authenticated";

    if (isGuestMode && status.value === "unauthenticated")
    {
        return;
    }

    if (isGuestMode && isAuthenticated)
    {
        return navigateTo (options.navigateAuthenticatedTo);
    }

    if (isAuthenticated)
    {
        return;
    }

    const loginRoute = authConfig.provider.pages.login;

    if (loginRoute && loginRoute === to.path)
    {
        return;
    }

    const globalAppMiddleware = authConfig.globalAppMiddleware;

    if (globalAppMiddleware === true || (typeof globalAppMiddleware === "object" && globalAppMiddleware.allow404WithoutAuth))
    {
        if (to.matched.length === 0)
        {
            return;
        }
    }

    if (options.navigateUnauthenticatedTo)
    {
        return navigateTo (options.navigateUnauthenticatedTo);
    }

    if (typeof globalAppMiddleware === "object" && globalAppMiddleware.addDefaultCallbackUrl)
    {
        const redirectUrl = typeof globalAppMiddleware.addDefaultCallbackUrl === "string"
            ? globalAppMiddleware.addDefaultCallbackUrl
            : to.fullPath;

        return navigateTo ({
            path: loginRoute,
            query: { redirect: redirectUrl, },
        });
    }

    return navigateTo (loginRoute);
});
