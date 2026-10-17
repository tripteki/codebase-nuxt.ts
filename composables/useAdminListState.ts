import type { CallResult } from "@/lib/call";
import type {
    OffsetPaginationResponse,
    PaginatedMeta,
    PaginatedResponse,
} from "@/types/admin/api";

type AdminListStateKeys = {
    items?: string;
    meta?: string;
    isLoading?: string;
    actionId?: string;
};

export function useAdminListState<T> (
    namespace: string,
    keys: AdminListStateKeys = {}
) {
    const items = useState<T[]> (keys.items ?? namespace, () => []);
    const meta = useState<PaginatedMeta | undefined> (
        keys.meta ?? `${namespace}-meta`,
        () => undefined
    );
    const isLoading = useState<boolean> (
        keys.isLoading ?? `${namespace}-loading`,
        () => false
    );
    const actionId = useState<string | null> (
        keys.actionId ?? `${namespace}-action-id`,
        () => null
    );

    return {
        items,
        meta,
        isLoading,
        actionId,
    };
}

export function parsePaginatedResult<T> (
    result: CallResult
): { items: T[]; meta: PaginatedMeta | undefined } | null {
    if (! result.isSuccess || ! result.data) {
        return null;
    }

    const payload = result.data as PaginatedResponse<T> &
        OffsetPaginationResponse<T>;

    if (payload.meta) {
        return {
            items: Array.isArray (payload.data) ? payload.data : [],
            meta: payload.meta,
        };
    }

    if ("totalPage" in payload || "lastPage" in payload) {
        const items = Array.isArray (payload.data) ? payload.data : [];
        const currentPage = payload.currentPage ?? 1;
        const perPage = payload.perPage ?? items.length;
        const from = items.length > 0 ? (currentPage - 1) * perPage + 1 : undefined;

        return {
            items,
            meta: {
                current_page: currentPage,
                last_page: payload.lastPage ?? payload.totalPage,
                per_page: payload.perPage,
                total: typeof payload.total === "number" ? payload.total : undefined,
                from,
                to: from === undefined ? undefined : from + items.length - 1,
            },
        };
    }

    return {
        items: [],
        meta: undefined,
    };
}

export function applyPaginatedResult<T> (
    result: CallResult,
    items: Ref<T[]>,
    meta: Ref<PaginatedMeta | undefined>
): void {
    const parsed = parsePaginatedResult<T> (result);

    if (! parsed) {
        return;
    }

    items.value = parsed.items;
    meta.value = parsed.meta;
}
