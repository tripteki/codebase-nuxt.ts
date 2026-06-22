import { computed, type ComputedRef, onMounted, ref, watch, } from "vue";
import { navigateTo, useAuth, } from "#imports";

import { hasValidAuthSession, } from "@/lib/auth-session";

function canRenderDuringAuthLoad (auth: ReturnType<typeof useAuth>): boolean {
    return Boolean (auth.token?.value?.trim ());
}

export function useRequireAuth (redirectTo = "/admin/auth/login"): {
    canRender: ComputedRef<boolean>;
} {
    const auth = useAuth ();
    const checked = ref (false);
    const hasRedirected = ref (false);

    const redirectIfNeeded = async (): Promise<void> => {
        if (! import.meta.client || hasRedirected.value) {
            return;
        }

        if (auth.status.value === "loading") {
            return;
        }

        if (! hasValidAuthSession (auth)) {
            hasRedirected.value = true;
            await navigateTo (redirectTo, { replace: true });
        }
    };

    onMounted (async () => {
        try {
            if (auth.status.value === "loading") {
                await auth.getSession ();
            }

            await redirectIfNeeded ();
        } finally {
            checked.value = true;
        }
    });

    watch (
        () => auth.status.value,
        () => {
            if (! checked.value) {
                return;
            }

            void redirectIfNeeded ();
        }
    );

    const canRender = computed (() => {
        if (! checked.value) {
            return false;
        }

        if (auth.status.value === "loading") {
            return canRenderDuringAuthLoad (auth);
        }

        return hasValidAuthSession (auth);
    });

    return { canRender };
}

export function useRequireGuest (redirectTo = "/admin/dashboard"): {
    canRender: ComputedRef<boolean>;
} {
    const auth = useAuth ();
    const checked = ref (false);
    const hasRedirected = ref (false);

    const redirectIfNeeded = async (): Promise<void> => {
        if (! import.meta.client || hasRedirected.value) {
            return;
        }

        if (auth.status.value === "loading") {
            return;
        }

        if (hasValidAuthSession (auth)) {
            hasRedirected.value = true;
            await navigateTo (redirectTo, { replace: true });
        }
    };

    onMounted (async () => {
        try {
            if (auth.status.value === "loading") {
                await auth.getSession ();
            }

            await redirectIfNeeded ();
        } finally {
            checked.value = true;
        }
    });

    watch (
        () => auth.status.value,
        () => {
            if (! checked.value) {
                return;
            }

            void redirectIfNeeded ();
        }
    );

    const canRender = computed (() => {
        if (! checked.value) {
            return true;
        }

        if (auth.status.value === "loading") {
            return true;
        }

        return ! hasValidAuthSession (auth);
    });

    return { canRender };
}
