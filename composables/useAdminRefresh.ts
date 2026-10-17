import { onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter, } from "vue";

import { useSocket, } from "@/composables/useSocket";
import type { RealtimeClient, } from "@/lib/realtime-client";
import { resolveSessionUserId, } from "@/lib/session-user";

const ADMIN_REFRESH_EVENT = "v1.admin.refresh";

export function useAdminRefresh (
    scopes: MaybeRefOrGetter<string[]>,
    onRefresh: () => void
): void {
    const { data: sessionData, } = useAuth ();
    let client: RealtimeClient | null = null;

    async function subscribe (): Promise<void> {
        const wanted = toValue (scopes);

        if (! import.meta.client || wanted.length === 0) {
            return;
        }

        const userId = resolveSessionUserId (sessionData.value);

        if (! userId) {
            return;
        }

        const { data, isSuccess, } = await useSocket ();

        if (! isSuccess || ! data) {
            return;
        }

        client = data;
        client.subscribeUserEvent (userId, ADMIN_REFRESH_EVENT, (payload) => {
            const incoming = Array.isArray (payload.scopes)
                ? payload.scopes.map (String)
                : [];

            if (incoming.some ((scope) => wanted.includes (scope))) {
                onRefresh ();
            }
        });
    }

    function unsubscribe (): void {
        client?.unsubscribe ();
        client?.disconnect ();
        client = null;
    }

    onMounted (() => {
        void subscribe ();
    });

    onBeforeUnmount (() => {
        unsubscribe ();
    });
}
