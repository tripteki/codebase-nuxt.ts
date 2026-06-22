import { describe, expect, it, } from "vitest";

import { resolveSessionUserId, } from "@/lib/session-user";

describe ("session-user", () =>
{
    it ("reads id from session root", () =>
    {
        expect (resolveSessionUserId ({ id: 42, })).toBe ("42");
        expect (resolveSessionUserId ({ id: " user-1 ", })).toBe ("user-1");
    });

    it ("falls back to session.user.id", () =>
    {
        expect (resolveSessionUserId ({
            user: { id: "abc", },
        })).toBe ("abc");
    });

    it ("returns undefined for missing session or id", () =>
    {
        expect (resolveSessionUserId (null)).toBeUndefined ();
        expect (resolveSessionUserId ({})).toBeUndefined ();
        expect (resolveSessionUserId ({ id: "", })).toBeUndefined ();
        expect (resolveSessionUserId ({ user: {}, })).toBeUndefined ();
    });
});
