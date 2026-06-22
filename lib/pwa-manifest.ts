import { defaultBrandColors, } from "./branding";

export type PwaManifestIcon = {
    src: string;
    sizes: string;
    type: string;
    purpose?: "any" | "maskable";
};

export type PwaManifest = {
    name: string;
    short_name: string;
    description: string;
    id: string;
    start_url: string;
    scope: string;
    display: "standalone";
    orientation: "portrait";
    theme_color: string;
    background_color: string;
    icons: PwaManifestIcon[];
};

type PwaManifestInput = {
    name: string;
    shortName: string;
    description: string;
    id?: string;
    startUrl?: string;
    scope?: string;
    themeColor?: string;
    backgroundColor?: string;
    icons?: PwaManifestIcon[];
};

export function resolvePwaIcons (): PwaManifestIcon[] {
    return [
        {
            src: "/manifest/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
        },
        {
            src: "/manifest/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
        },
        {
            src: "/manifest/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
        },
    ];
}

export function createPwaManifest ({
    name,
    shortName,
    description,
    id = "/",
    startUrl = "/",
    scope = "/",
    themeColor = defaultBrandColors.primary,
    backgroundColor = "#FFFFFF",
    icons,
}: PwaManifestInput): PwaManifest {
    const short_name =
        shortName.length > 12 ? shortName.slice (0, 12).trim () : shortName;

    return {
        name,
        short_name,
        description,
        id,
        start_url: startUrl,
        scope,
        display: "standalone",
        orientation: "portrait",
        theme_color: themeColor,
        background_color: backgroundColor,
        icons: icons ?? resolvePwaIcons (),
    };
}

export function resolvePwaManifestHref (): string {
    return "/api/pwa/manifest";
}

export function syncPwaHead (options: {
    fallbackAppName: string;
    themeColor?: string;
}): void {
    const formattedName =
        options.fallbackAppName.charAt (0).toUpperCase () +
        options.fallbackAppName.slice (1);
    const manifest = createPwaManifest ({
        name: formattedName,
        shortName: options.fallbackAppName,
        description: `The ${options.fallbackAppName} WebApp!`,
        themeColor: options.themeColor ?? defaultBrandColors.primary,
    });

    useHead ({
        link: [
            {
                rel: "manifest",
                href: resolvePwaManifestHref (),
                tagPriority: 30,
            },
        ],
        meta: [
            {
                name: "apple-mobile-web-app-title",
                content: manifest.short_name,
                tagPriority: 30,
            },
            {
                name: "application-name",
                content: manifest.short_name,
                tagPriority: 30,
            },
            {
                name: "theme-color",
                content: manifest.theme_color,
                tagPriority: 30,
            },
        ],
    });
}
