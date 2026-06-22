import { runWithActionId, } from "@/lib/admin-action";
import {
    appendAdminListFilter,
    buildAdminListParams,
} from "@/lib/admin-list-params";
import {
    applyPaginatedResult,
    useAdminListState,
} from "@/composables/useAdminListState";
import type {
    NotificationDto,
    NotificationUnreadDto,
} from "@/types/admin/notification";

export type NotificationStatusFilter = "" | "read" | "unread";

export function useNotifications () {
    const unread = useState<number>("notifications-unread", () => 0);
    const { items, meta, isLoading, actionId, } =
        useAdminListState<NotificationDto>("notifications", {
            items: "notifications-recent",
            meta: "notifications-meta",
            isLoading: "notifications-loading",
            actionId: "notifications-action-id",
        });

    const { call, } = useCall ();

    async function fetchUnread (): Promise<void> {
        const result = await call ({
            url: "/api/v1/notifications/unread",
            method: "GET",
        });

        if (result.isSuccess && result.data) {
            unread.value = (result.data as NotificationUnreadDto).unread ?? 0;
        }
    }

    async function fetchList (
        options: {
            limit?: number;
            current_page?: number;
            order?: string;
            status?: NotificationStatusFilter;
        } = {}
    ): Promise<void> {
        isLoading.value = true;

        const params = buildAdminListParams ({
            limit: options.limit,
            current_page: options.current_page,
            order: options.order,
            defaultLimit: 10,
            defaultOrder: "-updated_at",
        });

        appendAdminListFilter (params, "status", options.status, [
            "read",
            "unread",
        ]);

        const result = await call ({
            url: "/api/v1/notifications",
            method: "GET",
            params,
        });

        applyPaginatedResult (result, items, meta);
        isLoading.value = false;
    }

    async function fetchRecent (
        limit = 10,
        status: NotificationStatusFilter = ""
    ): Promise<void> {
        await fetchList ({
            limit,
            status,
        });
    }

    async function markAsRead (id: string): Promise<boolean> {
        const success = await runWithActionId (actionId, id, async () => {
            const result = await call ({
                url: `/api/v1/notifications/read/${id}`,
                method: "PUT",
            });

            return result.isSuccess;
        });

        if (success) {
            await refresh ();
        }

        return success;
    }

    async function markAllAsRead (): Promise<boolean> {
        const result = await call ({
            url: "/api/v1/notifications/read-all",
            method: "PUT",
        });

        if (! result.isSuccess) {
            return false;
        }

        await refresh ();

        return true;
    }

    async function deleteNotification (id: string): Promise<boolean> {
        const success = await runWithActionId (actionId, id, async () => {
            const result = await call ({
                url: `/api/v1/notifications/${id}`,
                method: "DELETE",
            });

            return result.isSuccess;
        });

        if (success) {
            await refresh ();
        }

        return success;
    }

    async function refresh (): Promise<void> {
        await fetchUnread ();
    }

    return {
        unread,
        items,
        meta,
        isLoading,
        actionId,
        fetchUnread,
        fetchList,
        fetchRecent,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
    };
}
