import type { Ref } from "vue";

import type { AdminActionResult } from "@/lib/call-message";

export function actionErrors (
    result: AdminActionResult,
    fallback: string
): Record<string, string> {
    return result.errors ?? { general: result.message ?? fallback };
}

export async function runWithActionId<T>(
    actionId: Ref<string | null>,
    id: string,
    task: () => Promise<T>
): Promise<T> {
    actionId.value = id;

    try {
        return await task ();
    } finally {
        actionId.value = null;
    }
}
