<script setup lang="ts">
import { computed, } from "vue";

import {
    notificationBody,
    notificationIsUnread,
    notificationTitle,
} from "@/lib/notification-presenter";
import { cn, } from "@/lib/utils";
import type { NotificationDto } from "@/types/admin/notification";

const props = defineProps<{
    item: NotificationDto;
}>();

const isUnread = computed (() => notificationIsUnread (props.item));
const title = computed (() => notificationTitle (props.item));
const body = computed (() => notificationBody (props.item));
</script>

<template>
    <div class="min-w-0 flex-1">
        <p
            :class="
                cn (
                    'truncate text-sm',
                    isUnread ? 'font-semibold' : 'font-medium'
                )
            ">
            {{ title }}
        </p>
        <p
            v-if="body"
            class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {{ body }}
        </p>
    </div>
</template>
