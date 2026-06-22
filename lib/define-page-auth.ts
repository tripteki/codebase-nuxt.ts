import { definePageMeta, } from "#imports";

export const AUTH_LOGIN_PATH = "/admin/auth/login";

export const AUTH_HOME_PATH = "/admin/dashboard";

export function definePagePublic (): void {
    definePageMeta ({
        auth: false,
    });
}

export function definePageGuest (
    navigateAuthenticatedTo: string = AUTH_HOME_PATH
): void {
    definePageMeta ({
        middleware: "app-auth",
        auth: {
            unauthenticatedOnly: true,
            navigateAuthenticatedTo,
        },
    });
}

export function definePageAuthed (): void {
    definePageMeta ({
        middleware: "app-auth",
        auth: true,
    });
}
