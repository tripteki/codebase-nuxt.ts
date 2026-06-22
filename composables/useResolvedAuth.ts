import { computed, onMounted, ref, } from "vue";

import { hasValidAuthSession, } from "@/lib/auth-session";
import { resolveSessionUserId, } from "@/lib/session-user";

type UseResolvedAuthOptions = {
    trustAuthenticatedBeforeResolve?: boolean;
};

export function useResolvedAuth (options: UseResolvedAuthOptions = {}) {
    const { status, data, getSession, token, } = useAuth ();
    const resolved = ref (false);

    onMounted (async () => {
        try {
            if (status.value === "loading") {
                await getSession ();
            }
        } catch {
            //
        } finally {
            resolved.value = true;
        }
    });

    const isAuthenticated = computed (() => {
        const trustAuth = options.trustAuthenticatedBeforeResolve ?? false;

        if (status.value === "loading") {
            return trustAuth || Boolean (token.value?.trim ());
        }

        if (status.value !== "authenticated") {
            return false;
        }

        if (! resolved.value) {
            return trustAuth;
        }

        return Boolean (resolveSessionUserId (data.value));
    });

    const isLoading = computed (
        () => ! resolved.value || status.value === "loading"
    );

    return {
        isAuthenticated,
        isLoading,
        status,
    };
}
