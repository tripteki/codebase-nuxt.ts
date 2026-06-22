type JwtPayload = {
    exp?: number;
};

export function isJwtExpired (
    token: string | null | undefined,
    skewSeconds: number = 60
): boolean {
    if (! token) {
        return true;
    }

    try {
        const segments = token.split (".");

        if (segments.length < 2 || ! segments[1]) {
            return true;
        }

        const payload = JSON.parse (
            Buffer.from (segments[1], "base64url").toString ("utf8")
        ) as JwtPayload;

        if (! payload.exp) {
            return false;
        }

        return Date.now () >= (payload.exp - skewSeconds) * 1000;
    } catch {
        return true;
    }
}
