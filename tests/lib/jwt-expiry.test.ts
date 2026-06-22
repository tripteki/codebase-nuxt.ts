import { describe, expect, it, } from "vitest";

import { isJwtExpired, } from "@/lib/jwt-expiry";

function encodePayload (payload: Record<string, unknown>): string
{
    const header = Buffer.from (JSON.stringify ({ alg: "none", typ: "JWT", })).toString ("base64url");
    const body = Buffer.from (JSON.stringify (payload)).toString ("base64url");

    return `${header}.${body}.signature`;
}

describe ("isJwtExpired", () =>
{
    it ("returns true when token is missing", () =>
    {
        expect (isJwtExpired (null)).toBe (true);
        expect (isJwtExpired ("")).toBe (true);
    });

    it ("returns false when token is still valid", () =>
    {
        const token = encodePayload ({
            exp: Math.floor (Date.now () / 1000) + 3600,
        });

        expect (isJwtExpired (token)).toBe (false);
    });

    it ("returns true when token is expired", () =>
    {
        const token = encodePayload ({
            exp: Math.floor (Date.now () / 1000) - 120,
        });

        expect (isJwtExpired (token)).toBe (true);
    });
});
