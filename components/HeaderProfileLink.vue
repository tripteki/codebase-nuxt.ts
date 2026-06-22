<script setup lang="ts">
import { computed, } from "vue";
import { useAuth, useTranslation, } from "#imports";

import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar";
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
        class="rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar class="h-8 w-8 text-xs" shape="circle">
            <AvatarImage v-if="avatarUrl" :src="avatarUrl" alt="" />
            <AvatarFallback class="text-xs font-medium">
                {{ initials }}
            </AvatarFallback>
        </Avatar>
    </NuxtLink>
</template>
