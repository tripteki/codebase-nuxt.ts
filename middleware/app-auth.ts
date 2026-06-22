import { hasValidAuthSession, validateAuthSession, } from "@/lib/auth-session";
import { readAuthTokenCookie, } from "@/lib/auth-cookies";

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
};

function resolveRedirectTarget (redirect: unknown, fallback: string): string
{
    if (
        typeof redirect === "string"
        && redirect.startsWith ("/")
        && ! redirect.startsWith ("//")
    )
    {
        return redirect;
    }

    return fallback;
}

export default defineNuxtRouteMiddleware (async (to) =>
{
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

    const loginRoute = authConfig.provider.pages.login;

    if (import.meta.server)
    {
        const hasTokenCookie = Boolean (readAuthTokenCookie ()?.trim ());

        if (options.unauthenticatedOnly)
        {
            if (! hasTokenCookie)
            {
                return;
            }

            return navigateTo (
                resolveRedirectTarget (to.query.redirect, options.navigateAuthenticatedTo),
                { replace: true, }
            );
        }

        if (! hasTokenCookie)
        {
            if (options.navigateUnauthenticatedTo)
            {
                return navigateTo (options.navigateUnauthenticatedTo, { replace: true, });
            }

            return navigateTo ({
                path: loginRoute,
                query: { redirect: to.fullPath, },
            }, { replace: true, });
        }

        return;
    }

    const auth = useAuth ();

    let isAuthenticated = hasValidAuthSession (auth);

    if (! isAuthenticated) {
        isAuthenticated = await validateAuthSession (auth);
    }

    if (options.unauthenticatedOnly)
    {
        if (! isAuthenticated)
        {
            return;
        }

        return navigateTo (
            resolveRedirectTarget (to.query.redirect, options.navigateAuthenticatedTo),
            { replace: true, }
        );
    }

    if (isAuthenticated)
    {
        return;
    }

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
        return navigateTo (options.navigateUnauthenticatedTo, { replace: true, });
    }

    if (typeof globalAppMiddleware === "object" && globalAppMiddleware.addDefaultCallbackUrl)
    {
        const redirectUrl = typeof globalAppMiddleware.addDefaultCallbackUrl === "string"
            ? globalAppMiddleware.addDefaultCallbackUrl
            : to.fullPath;

        return navigateTo ({
            path: loginRoute,
            query: { redirect: redirectUrl, },
        }, { replace: true, });
    }

    return navigateTo ({
        path: loginRoute,
        query: { redirect: to.fullPath, },
    }, { replace: true, });
});
