function jsonPointerParse (pointer: string): string[] {
    if (pointer === "" || pointer === "/") {
        return [];
    }

    if (pointer.charAt (0) !== "/") {
        throw new Error (`Invalid JSON pointer: ${pointer}`);
    }

    return pointer
        .substring (1)
        .split (/\//)
        .map ((segment) => segment.replace (/~1/g, "/").replace (/~0/g, "~"));
}

function jsonPointerSet (
    obj: Record<string, unknown>,
    pointer: string | string[],
    value: unknown
): void {
    const refTokens = Array.isArray (pointer)
        ? pointer
        : jsonPointerParse (pointer);
    let nextTok: string | number = refTokens[0] ?? "";

    if (refTokens.length === 0) {
        throw new Error ("Can not set the root object");
    }

    for (let index = 0; index < refTokens.length - 1; index++) {
        let token: string | number = refTokens[index] ?? "";

        if (typeof token !== "string" && typeof token !== "number") {
            token = String (token);
        }

        if (
            token === "__proto__" ||
            token === "constructor" ||
            token === "prototype"
        ) {
            continue;
        }

        if (token === "-" && Array.isArray (obj)) {
            token = obj.length;
        }

        nextTok = refTokens[index + 1] ?? "";

        if (! (String (token) in obj)) {
            const nextKey = String (nextTok);

            obj[String (token)] = nextKey.match (/^(\d+|-)$/) ? [] : {};
        }

        obj = obj[String (token)] as Record<string, unknown>;
    }

    if (nextTok === "-" && Array.isArray (obj)) {
        nextTok = String (obj.length);
    }

    obj[String (nextTok)] = value;
}

export function jsonPointerGet<TResult = unknown>(
    obj: Record<string, unknown>,
    pointer: string
): TResult {
    const refTokens = jsonPointerParse (pointer);
    let current: unknown = obj;

    for (const token of refTokens) {
        if (
            ! (
                typeof current === "object" &&
                current !== null &&
                token in current
            )
        ) {
            throw new Error (`Invalid reference token: ${token}`);
        }

        current = (current as Record<string, unknown>)[token];
    }

    return current as TResult;
}

export function objectFromJsonPointer (
    pointer: string,
    value: unknown
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    jsonPointerSet (result, pointer, value);

    return result;
}
