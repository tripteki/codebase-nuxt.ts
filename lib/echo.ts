import Echo from "laravel-echo";
import Pusher from "pusher-js";

type Detail = {
    apiUrl?: string;
    reverbAppKey?: string;
    reverbHost?: string;
    reverbPort?: number;
    reverbScheme?: string;
};

const resolveApiRootUrl = (baseURL: string): string => {
    return baseURL.replace (/\/api\/?$/, "");
};

export const createEcho = (accessToken: string, detail?: Detail): Echo<any> => {
    const config = useRuntimeConfig ();

    if (import.meta.client) {
        (window as typeof window & { Pusher: typeof Pusher }).Pusher = Pusher;
    }

    const apiUrl: string =
        detail?.apiUrl ??
        String (
            config.public.apiUrl ??
                resolveApiRootUrl (String (config.public.baseURL))
        );

    const reverbAppKey: string =
        detail?.reverbAppKey ?? String (config.public.reverbAppKey ?? "");
    const reverbHost: string =
        detail?.reverbHost ?? String (config.public.reverbHost ?? "127.0.0.1");
    const reverbPort: number =
        detail?.reverbPort ?? Number (config.public.reverbPort ?? 8080);
    const reverbScheme: string =
        detail?.reverbScheme ?? String (config.public.reverbScheme ?? "http");

    return new Echo ({
        broadcaster: "reverb",
        key: reverbAppKey,
        wsHost: reverbHost,
        wsPort: reverbPort,
        wssPort: reverbPort,
        forceTLS: reverbScheme === "https",
        enabledTransports: ["ws", "wss"],

        authEndpoint: `${apiUrl}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
};
