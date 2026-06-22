/**
 * Prefixes that must never use the offline SPA shell (network-only navigation).
 * New routes under these paths are excluded automatically — no per-route regex needed.
 */
export const PWA_OFFLINE_SHELL_EXCLUDED_PREFIXES = [
    "/api",
    "/admin",
    "/auth",
    "/notifications",
] as const;

/** SW / manifest assets — never navigation-fallback targets. */
export const PWA_SW_ASSET_PATH_PATTERNS: RegExp[] = [
    /^\/sw\.js$/,
    /^\/workbox-.*\.js$/,
    /^\/manifest\.webmanifest$/,
    /^\/api\/pwa\/manifest$/,
];

function matchesExcludedPrefix (pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith (`${prefix}/`);
}

export function isPwaNavigationDenied (pathname: string): boolean {
    if (PWA_SW_ASSET_PATH_PATTERNS.some ((pattern) => pattern.test (pathname))) {
        return true;
    }

    return PWA_OFFLINE_SHELL_EXCLUDED_PREFIXES.some ((prefix) =>
        matchesExcludedPrefix (pathname, prefix)
    );
}

function escapeRegex (value: string): string {
    return value.replace (/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Workbox `navigateFallbackDenylist` — derived from the prefixes above. */
export function buildPwaNavigationDenylist (): RegExp[] {
    return [
        ...PWA_SW_ASSET_PATH_PATTERNS,
        ...PWA_OFFLINE_SHELL_EXCLUDED_PREFIXES.map (
            (prefix) => new RegExp (`^${escapeRegex (prefix)}(?:\\/|$)`)
        ),
    ];
}

export const PWA_NAVIGATION_DENYLIST = buildPwaNavigationDenylist ();
