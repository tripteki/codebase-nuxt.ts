import { describe, expect, it, } from "vitest";

import { resolveApiBaseUrl, } from "@/lib/api-base";

describe ("api-base", () =>
{
    it ("prefers apiUrl and strips trailing slash", () =>
    {
        expect (resolveApiBaseUrl ({
            apiUrl: "http://api.example.com/",
            baseURL: "http://ignored.example.com/api",
        })).toBe ("http://api.example.com");
    });

    it ("derives host from baseURL without /api suffix", () =>
    {
        expect (resolveApiBaseUrl ({
            baseURL: "http://api.backend.localhost/api",
        })).toBe ("http://api.backend.localhost");

        expect (resolveApiBaseUrl ({
            baseURL: "http://api.backend.localhost/api/",
        })).toBe ("http://api.backend.localhost");
    });
});
