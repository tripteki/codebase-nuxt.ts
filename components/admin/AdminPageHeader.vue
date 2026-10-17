<script setup lang="ts">
import { computed, } from "vue";
import { useRoute, useTranslation, } from "#imports";

import AdminCrumbIcon from "@/components/admin/AdminCrumbIcon.vue";
import { adminPageCrumbs, } from "@/lib/admin-page-crumbs";
import {
    fbAdminBreadcrumb,
    fbAdminBreadcrumbCurrent,
    fbAdminPageHeader,
    fbMuted,
} from "@/lib/flowbite-classes";

const props = defineProps<{
    title: string;
    description?: string;
}> ();

const route = useRoute ();
const { t, } = useTranslation ("common");
const items = computed (() => adminPageCrumbs (route.path, props.title, t));
</script>

<template>
    <div :class="fbAdminPageHeader">
        <div class="mb-1 w-full">
        <nav class="mb-5 flex" :aria-label="t ('aria_breadcrumb')">
            <ol class="inline-flex flex-wrap items-center gap-y-1 text-sm font-medium md:gap-x-2">
                <li
                    v-for="(item, index) in items"
                    :key="`${item.label}-${index}`"
                    class="inline-flex items-center">
                    <svg
                        v-if="index > 0"
                        class="mx-1 h-6 w-6 shrink-0 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true">
                        <path
                            fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
                            clip-rule="evenodd" />
                    </svg>
                    <NuxtLink v-if="item.to" :to="item.to" :class="[fbAdminBreadcrumb, index > 0 ? 'ms-1 md:ms-2' : '',]">
                        <span class="me-2 inline-flex h-4 w-4 shrink-0" aria-hidden="true">
                            <AdminCrumbIcon :name="item.icon" />
                        </span>
                        {{ item.label }}
                    </NuxtLink>
                    <span v-else :class="[fbAdminBreadcrumbCurrent, 'inline-flex items-center', index > 0 ? 'ms-1 md:ms-2' : '',]" aria-current="page">
                        <span class="me-2 inline-flex h-4 w-4 shrink-0" aria-hidden="true">
                            <AdminCrumbIcon :name="item.icon" />
                        </span>
                        {{ item.label }}
                    </span>
                </li>
            </ol>
        </nav>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
                <h1 class="min-w-0 break-words text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    {{ title }}
                </h1>
                <p v-if="description" :class="[fbMuted, 'mt-1',]">
                    {{ description }}
                </p>
            </div>
            <div v-if="$slots.actions" class="flex w-full shrink-0 flex-nowrap items-center justify-end gap-2 sm:ms-auto sm:w-auto">
                <slot name="actions" />
            </div>
        </div>
        </div>
    </div>
</template>
