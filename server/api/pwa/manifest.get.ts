import { formatAppName, } from "@/lib/app-name";
import { createPwaManifest, } from "@/lib/pwa-manifest";

export default defineEventHandler ((event) => {
    const config = useRuntimeConfig ();
    const formattedName = formatAppName (String (config.public.appName ?? "App"));

    const manifest = createPwaManifest ({
        name: formattedName,
        shortName: formattedName,
        description: `The ${formattedName} WebApp!`,
    });

    setHeader (
        event,
        "Content-Type",
        "application/manifest+json; charset=utf-8"
    );
    setHeader (event, "Cache-Control", "public, max-age=300");

    return manifest;
});
