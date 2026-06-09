import { callServer, } from "../../utils/call-server";

export default defineEventHandler (async (event) =>
{
    const authorization = getHeader (event, "authorization");
    const token = authorization?.replace (/^Bearer\s+/i, "");
    const config = useRuntimeConfig ();

    if (token)
    {
        await callServer ({
            baseUrl: config.public.authURL as string,
            url: "/logout",
            method: "POST",
        }, token);
    }

    return true;
});
