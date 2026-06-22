import { createPwaManifest, } from "@/lib/pwa-manifest";

export default defineEventHandler ((event) => {
    const config = useRuntimeConfig ();
    const appName = String (config.public.appName ?? "App");
    const formattedName = appName.charAt (0).toUpperCase () + appName.slice (1);

    const manifest = createPwaManifest ({
        name: formattedName,
        shortName: appName,
        description: `The ${appName} WebApp!`,
    });

    setHeader (
        event,
        "Content-Type",
        "application/manifest+json; charset=utf-8"
    );
    setHeader (event, "Cache-Control", "public, max-age=300");

    return manifest;
});
