import { callServer, } from "../../utils/call-server";

export default defineEventHandler (async (event) =>
{
    const authorization = getHeader (event, "authorization");
    const token = authorization?.replace (/^Bearer\s+/i, "");
    const config = useRuntimeConfig ();

    if (! token)
    {
        throw createError ({
            statusCode: 401,
            statusMessage: "Unauthorized",
        });
    }

    const response = await callServer ({
        baseUrl: config.public.authURL as string,
        url: "/me",
        method: "GET",
    }, token);

    if (response.isError)
    {
        throw createError ({
            statusCode: 401,
            statusMessage: "Unauthorized",
        });
    }

    return {
        user: response.data,
    };
});
