import { resolveApiBaseUrl, } from "@/lib/api-base";

export type RealtimeDriver = "echo" | "socketio";

export type RealtimeConnectionConfig = {
    driver: RealtimeDriver;
    apiUrl: string;
    reverbAppKey: string;
    reverbHost: string;
    reverbPort: number;
    reverbScheme: string;
    socketPath: string;
};

export const resolveRealtimeDriver = (value?: string): RealtimeDriver =>
    value === "socketio" ? "socketio" : "echo";

export const buildRealtimeConnectionConfig = (
    overrides: Partial<RealtimeConnectionConfig> = {}
): RealtimeConnectionConfig => {
    const config = useRuntimeConfig ();

    const apiUrl =
        overrides.apiUrl ??
        resolveApiBaseUrl ({
            apiUrl: String (config.public.apiUrl ?? ""),
            baseURL: String (config.public.baseURL ?? ""),
        });

    return {
        driver:
            overrides.driver ??
            resolveRealtimeDriver (
                String (config.public.realtimeDriver ?? "echo")
            ),
        apiUrl,
        reverbAppKey:
            overrides.reverbAppKey ?? String (config.public.reverbAppKey ?? ""),
        reverbHost:
            overrides.reverbHost ??
            String (config.public.reverbHost ?? "127.0.0.1"),
        reverbPort:
            overrides.reverbPort ?? Number (config.public.reverbPort ?? 8080),
        reverbScheme:
            overrides.reverbScheme ??
            String (config.public.reverbScheme ?? "http"),
        socketPath: overrides.socketPath ?? "/socket.io",
    };
};
