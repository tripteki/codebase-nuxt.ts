<script setup lang="ts">
import { computed, } from "vue";
import { useTranslation, } from "#imports";

import NotificationIcon from "@/components/admin/NotificationIcon.vue";
import { useLocale, } from "@/composables/useLocale";
import { formatStamp, } from "@/lib/format-display";
import { formatRelativeTime, } from "@/lib/format-relative-time";
import {
    notificationBody,
    notificationIconName,
    notificationIsUnread,
    notificationTargetIsFile,
    notificationTargetUrl,
    notificationTheme,
    notificationTitle,
} from "@/lib/notification-presenter";
import { cn, } from "@/lib/utils";
import type { NotificationDto, } from "@/types/admin/notification";

const props = withDefaults (
    defineProps<{
        item: NotificationDto;
        compact?: boolean;
    }> (),
    {
        compact: true,
    }
);

const { t, } = useTranslation ("common");
const { currentLocale, } = useLocale ();
const targetUrl = computed (() => notificationTargetUrl (props.item));
const targetIsFile = computed (() => notificationTargetIsFile (props.item));
const stamp = computed (() => formatStamp (props.item.created_at));
const isUnread = computed (() => notificationIsUnread (props.item));
const title = computed (() => notificationTitle (props.item));
const body = computed (() => notificationBody (props.item));
const relativeTime = computed (() =>
    formatRelativeTime (props.item.created_at, String (currentLocale.value || "en"))
);
</script>

<template>
    <div class="flex min-w-0 flex-1 items-start gap-3">
        <NotificationIcon
            :name="notificationIconName (item)"
            :is-read="! isUnread"
            :theme="notificationTheme (item)"
            :size="compact ? 'sm' : 'lg'" />
        <div class="min-w-0 flex-1 overflow-hidden">
            <p
                :class="cn (
                    'truncate text-sm text-gray-900 dark:text-white',
                    compact ? 'font-medium' : 'font-semibold',
                    isUnread && 'font-semibold'
                )">
                {{ title }}
            </p>
            <p
                v-if="body"
                :class="cn (
                    'mt-0.5 text-gray-500 dark:text-gray-400',
                    compact ? 'line-clamp-2 text-xs' : 'break-words text-sm'
                )">
                {{ body }}
            </p>
            <NuxtLink
                v-if="! compact && targetUrl"
                :to="targetUrl"
                target="_blank"
                rel="noopener"
                class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-primary)] hover:underline"
                @click.stop>
                <svg v-if="targetIsFile" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {{ targetIsFile ? t ("download") : t ("visit") }}
            </NuxtLink>
            <p
                v-if="relativeTime || (! compact && stamp !== '-')"
                :class="cn ('mt-1 text-gray-500 dark:text-gray-400', compact ? 'text-xs' : 'text-xs text-gray-400 dark:text-gray-500')">
                {{ compact ? relativeTime : `${stamp}${relativeTime ? ` (${relativeTime})` : ""}` }}
            </p>
        </div>
    </div>
</template>
