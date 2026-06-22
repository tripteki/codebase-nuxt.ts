type LocalAuthCookieConfig = {
    provider?: {
        token?: { cookieName?: string };
        refresh?: {
            isEnabled?: boolean;
            token?: { cookieName?: string };
        };
    };
};

export function resolveAuthTokenCookieName (): string {
    const config = useRuntimeConfig ().public.auth as LocalAuthCookieConfig;

    return config.provider?.token?.cookieName ?? "auth.token";
}

export function resolveAuthRefreshCookieName (): string {
    const config = useRuntimeConfig ().public.auth as LocalAuthCookieConfig;

    return config.provider?.refresh?.token?.cookieName ?? "auth.refresh-token";
}

export function readAuthTokenCookie (): string | null | undefined {
    return useCookie<string | null>(resolveAuthTokenCookieName ()).value;
}

export function clearAuthCookies (): void {
    const tokenCookie = useCookie<string | null>(resolveAuthTokenCookieName ());
    const refreshCookie = useCookie<string | null>(
        resolveAuthRefreshCookieName ()
    );

    tokenCookie.value = null;
    refreshCookie.value = null;
}
