declare module "@sidebase/nuxt-auth/dist/runtime/types" {
    interface SessionData {
        id?: string;
        jwt?: string;
        accessToken?: string;
        refreshToken?: string;
        user?: Record<string, any> & {
            id?: string;
            name?: string | null;
            email?: string | null;
        };
    }
}

export {};
