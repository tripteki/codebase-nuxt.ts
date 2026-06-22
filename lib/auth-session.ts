import { resolveSessionUserId, } from "@/lib/session-user";

type AuthSessionLike = {
    status: { value: string };
    data: { value: unknown };
    token?: { value: string | null };
    getSession: (options?: { force?: boolean }) => Promise<unknown>;
};

export function hasValidAuthSession (auth: AuthSessionLike): boolean {
    return (
        auth.status.value === "authenticated" &&
        Boolean (auth.token?.value?.trim ()) &&
        Boolean (
            resolveSessionUserId (
                auth.data.value as Parameters<typeof resolveSessionUserId>[0]
            )
        )
    );
}

export async function validateAuthSession (
    auth: AuthSessionLike,
    options: { force?: boolean } = { force: false }
): Promise<boolean> {
    if (hasValidAuthSession (auth)) {
        return true;
    }

    if (auth.status.value !== "loading") {
        await auth.getSession ({ force: options.force ?? false });
    } else {
        for (let attempt = 0; attempt < 20; attempt++) {
            await auth.getSession ({ force: options.force ?? false });

            if (auth.status.value !== "loading") {
                break;
            }

            await new Promise ((resolve) => setTimeout (resolve, 50));
        }
    }

    return hasValidAuthSession (auth);
}
