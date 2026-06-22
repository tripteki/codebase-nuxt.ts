import type { RealtimeClient } from "@/lib/realtime-client";

import { useSocket, } from "@/composables/useSocket";
import { useNotifications, } from "@/composables/useNotifications";
import { resolveSessionUserId, } from "@/lib/session-user";
import type { NotificationDto } from "@/types/admin/notification";

type NotificationCreatedPayload = {
    id?: string;
    unread?: number;
};

const NOTIFICATION_CREATED_EVENT = "v1.notification.created";

export function useNotificationBroadcast () {
    const { data: sessionData, } = useAuth ();
    const { unread, refresh, } = useNotifications ();

    let clientInstance: RealtimeClient | null = null;

    async function handleNotificationCreated (
        payload: NotificationCreatedPayload
    ): Promise<void> {
        if (typeof payload.unread === "number") {
            unread.value = payload.unread;
        } else {
            await refresh ();
        }

        if (typeof payload.id === "string" && payload.id.trim () !== "") {
            await handleRealtimeNotification (payload.id);
        }
    }

    async function subscribe (): Promise<void> {
        if (! import.meta.client) {
            return;
        }

        const userId = resolveSessionUserId (sessionData.value);

        if (! userId) {
            return;
        }

        await unsubscribe ();

        const { data: client, isSuccess, } = await useSocket ();

        if (! isSuccess || ! client) {
            return;
        }

        clientInstance = client;

        client.subscribeUserEvent (
            userId,
            NOTIFICATION_CREATED_EVENT,
            (payload) => {
                void handleNotificationCreated (
                    payload as NotificationCreatedPayload
                );
            }
        );
    }

    async function unsubscribe (): Promise<void> {
        if (! clientInstance) {
            clientInstance = null;

            return;
        }

        clientInstance.unsubscribe ();
        clientInstance.disconnect ();
        clientInstance = null;
    }

    return {
        subscribe,
        unsubscribe,
    };
}

export async function handleRealtimeNotification (
    notificationId: string
): Promise<void> {
    if (! import.meta.client || notificationId.trim () === "") {
        return;
    }

    const { call, } = useCall ();

    const result = await call ({
        url: `/api/v1/notifications/${notificationId}`,
        method: "GET",
    });

    if (! result.isSuccess || ! result.data) {
        return;
    }

    const item = result.data as NotificationDto;
    const data = item.data ?? {};
    const title = typeof data.title === "string" ? data.title.trim () : "";
    const message = typeof data.message === "string" ? data.message.trim () : "";
    const body =
        title && message && title !== message
            ? `${title}: ${message}`
            : title || message || item.type;

    useToastify (body, {
        type: item.type.includes ("failed") ? "error" : "success",
        autoClose: 5000,
    });
}
