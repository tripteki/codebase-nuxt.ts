<script setup lang="ts">
import { useAuth, useTranslation, } from "#imports";

import I18nSwitcher from "@/components/I18nSwitcher.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { Button, } from "@/components/ui/button";

defineProps<{
    showLogout?: boolean;
}>();

const { t: tCommon, } = useTranslation ("common");
const { t: tAuth, } = useTranslation ("auth");
const { signOut, getSession, } = useAuth ();
const { clearToken, } = useAuthState ();

async function handleLogout (): Promise<void>
{
    try
    {
        await signOut ({
            redirect: true,
            callbackUrl: "/admin/auth/login",
        });
    }
    catch (error)
    {
        console.error ("Logout error:", error);
        clearToken ();
        await getSession ({ force: true, });
        await navigateTo ("/admin/auth/login", { replace: true, });
    }
}
</script>

<template>
    <header class="border-b">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 class="text-xl font-bold">
                {{ tCommon("welcome") }}
            </h1>

            <div class="flex items-center gap-4">
                <ThemeToggle />
                <I18nSwitcher />
                <Button
                    v-if="showLogout"
                    variant="outline"
                    type="button"
                    @click="handleLogout"
                >
                    {{ tAuth("logout") }}
                </Button>
            </div>
        </div>
    </header>
</template>
