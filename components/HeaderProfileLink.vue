<script setup lang="ts">
import { computed, } from "vue";
import { useAuth, useTranslation, } from "#imports";

import { getUserInitials, } from "@/lib/user-initials";
import type { UserMeDto } from "@/types/admin/settings";

const { t, } = useTranslation ("common");
const { data, } = useAuth ();

const user = computed (() => data.value?.user as UserMeDto | undefined);
const avatarUrl = computed (() => user.value?.profile?.avatar_url ?? undefined);
const initials = computed (() =>
    getUserInitials (
        user.value?.profile?.full_name ?? user.value?.name,
        user.value?.email
    )
);
</script>

<template>
    <NuxtLink
        to="/admin/settings"
        :aria-label="t ('profile')"
        data-test="profile-link"
        class="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2">
        <div
            class="icon-avatar-brand flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-medium">
            <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt=""
                class="h-full w-full object-cover" />
            <span v-else>{{ initials }}</span>
        </div>
    </NuxtLink>
</template>
