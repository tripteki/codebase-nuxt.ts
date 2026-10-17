import { computed, } from "vue";

import { useCall, } from "@/composables/useCall";
import { UserRoleEnum, } from "@/lib/user-role";

export function useAdminAccesses () {
    const { call, } = useCall ();
    const permissions = useState<string[]> ("admin-permissions", () => []);
    const roles = useState<string[]> ("admin-roles", () => []);
    const loaded = useState<boolean> ("admin-access-loaded", () => false);

    const isSuperadmin = computed (() =>
        roles.value.includes (UserRoleEnum.Superadmin)
    );

    function can (permission?: string): boolean {
        if (! permission || isSuperadmin.value) {
            return true;
        }

        return permissions.value.includes (permission);
    }

    async function ensureLoaded (): Promise<void> {
        if (loaded.value) {
            return;
        }

        const result = await call ({
            url: "/api/v1/users/me/accesses",
            method: "GET",
        });

        if (! result.isSuccess) {
            loaded.value = true;

            return;
        }

        const payload = result.data ?? {};

        permissions.value = Array.isArray (payload.permissions) ? payload.permissions : [];
        roles.value = Array.isArray (payload.roles) ? payload.roles : [];
        loaded.value = true;
    }

    return {
        permissions,
        roles,
        loaded,
        isSuperadmin,
        can,
        ensureLoaded,
    };
}
