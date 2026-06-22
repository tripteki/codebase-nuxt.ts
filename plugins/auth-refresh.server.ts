import { joinURL, parseURL, withLeadingSlash, } from "ufo";

import { isJwtExpired, } from "@/lib/jwt-expiry";
import { jsonPointerGet, objectFromJsonPointer, } from "@/lib/json-pointer";

type LocalAuthProvider = {
    refresh: {
        endpoint: {
            path: string;
            method: "get" | "post" | "put" | "patch" | "delete";
        };
        token: {
            refreshRequestTokenPointer: string;
            refreshResponseTokenPointer?: string;
            signInResponseRefreshTokenPointer: string;
        };
        refreshOnlyToken?: boolean;
    };
    token: {
        headerName: string;
        signInResponseTokenPointer: string;
    };
};

function resolveAuthEndpoint (path: string): string {
    const runtimeConfig = useRuntimeConfig ();
    const authConfig = runtimeConfig.public.auth as {
        baseURL: string;
        disableInternalRouting?: boolean;
    };

    if (path.startsWith ("http://") || path.startsWith ("https://")) {
        return path;
    }

    let baseURL = authConfig.baseURL;

    if (! authConfig.disableInternalRouting) {
        baseURL = withLeadingSlash (parseURL (baseURL).pathname);
    }

    return joinURL (baseURL, path);
}

export default defineNuxtPlugin ({
    name: "codebase-refresh-token-plugin",
    enforce: "pre",
    async setup () {
        const {
            rawToken,
            rawRefreshToken,
            refreshToken,
            token,
            lastRefreshedAt,
        } = useAuthState ();

        if (
            ! refreshToken.value ||
            ! token.value ||
            ! isJwtExpired (rawToken.value)
        ) {
            return;
        }

        const provider = (
            useRuntimeConfig ().public.auth as { provider: LocalAuthProvider }
        ).provider;
        const { path, method, } = provider.refresh.endpoint;
        const refreshRequestTokenPointer =
            provider.refresh.token.refreshRequestTokenPointer;
        const headers = new Headers ({
            [provider.token.headerName]: token.value,
        });

        try {
            const response = await $fetch<Record<string, unknown>>(
                resolveAuthEndpoint (path),
                {
                    method,
                    body: objectFromJsonPointer (
                        refreshRequestTokenPointer,
                        refreshToken.value
                    ),
                    headers,
                    credentials: "include",
                }
            );

            const tokenPointer =
                provider.refresh.token.refreshResponseTokenPointer ||
                provider.token.signInResponseTokenPointer;
            const extractedToken = jsonPointerGet<string>(
                response,
                tokenPointer
            );

            if (typeof extractedToken !== "string") {
                return;
            }

            if (! provider.refresh.refreshOnlyToken) {
                const extractedRefreshToken = jsonPointerGet<string>(
                    response,
                    provider.refresh.token.signInResponseRefreshTokenPointer
                );

                if (typeof extractedRefreshToken !== "string") {
                    return;
                }

                rawRefreshToken.value = extractedRefreshToken;
            }

            rawToken.value = extractedToken;
            lastRefreshedAt.value = new Date ();
        } catch {
            rawRefreshToken.value = null;
            rawToken.value = null;
        }
    },
});
