import { describe, expect, it, } from "vitest";

import { buildAuthLoginPayload, } from "../../lib/auth-login-payload";

describe ("buildAuthLoginPayload", () =>
{
    it ("maps email identifiers", () =>
    {
        expect (buildAuthLoginPayload ({
            identifier: "superuser@mail.com",
            password: "12345678",
            remember: true,
        })).toEqual ({
            identifierKey: "email",
            identifierValue: "superuser@mail.com",
            identifier: "superuser@mail.com",
            password: "12345678",
            remember: true,
        });
    });

    it ("maps username identifiers", () =>
    {
        expect (buildAuthLoginPayload ({
            identifier: "superuser",
            password: "12345678",
        })).toEqual ({
            identifierKey: "name",
            identifierValue: "superuser",
            identifier: "superuser",
            password: "12345678",
        });
    });
});
