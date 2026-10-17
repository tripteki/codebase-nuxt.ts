<script setup lang="ts">
import { useTranslation, } from "#imports";

import FbSkeleton from "@/components/flowbite/FbSkeleton.vue";
import {
    fbAdminTable,
    fbAdminTableHead,
    fbAdminTableRow,
    fbAdminTableWrap,
} from "@/lib/flowbite-classes";

withDefaults (
    defineProps<{
        rows?: number;
        cols?: number;
    }> (),
    {
        rows: 6,
        cols: 5,
    },
);

const { t, } = useTranslation ("common");
</script>

<template>
    <div :class="fbAdminTableWrap" role="status" aria-busy="true" aria-live="polite">
        <span class="sr-only">{{ t ("loading") }}</span>
        <table :class="fbAdminTable">
            <thead :class="fbAdminTableHead">
                <tr>
                    <th v-for="column in cols" :key="`head-${column}`" class="px-6 py-3">
                        <FbSkeleton class-name="h-3 w-20" />
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows" :key="`row-${row}`" :class="fbAdminTableRow">
                    <td v-for="column in cols" :key="`cell-${row}-${column}`" class="px-6 py-4">
                        <FbSkeleton :class-name="column === 1 ? 'h-4 w-36' : 'h-4 w-24'" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
