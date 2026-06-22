type SessionLike =
    | {
          id?: string | number;
          user?:
              | {
                    id?: string | number;
                }
              | Record<string, unknown>
              | null;
      }
    | null
    | undefined;

function normalizeUserId (
    value: string | number | undefined
): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    const normalized = String (value).trim ();

    return normalized !== "" ? normalized : undefined;
}

export function resolveSessionUserId (session: SessionLike): string | undefined {
    if (! session) {
        return undefined;
    }

    const fromSession = normalizeUserId (session.id);

    if (fromSession) {
        return fromSession;
    }

    const user = session.user;

    if (user && typeof user === "object" && "id" in user) {
        return normalizeUserId (user.id as string | number | undefined);
    }

    return undefined;
}
