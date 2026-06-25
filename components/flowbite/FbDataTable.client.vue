<script setup lang="ts">
import { DataTable, } from "simple-datatables";
import { onBeforeUnmount, onMounted, ref, watch, } from "vue";

import { fbDataTable, fbDataTableWrap, } from "@/lib/flowbite-classes";
import { cn, } from "@/lib/utils";

const props = withDefaults(
    defineProps<{
        tableId?: string;
        options?: Record<string, unknown>;
        wrapperClass?: string;
    }>(),
    {}
);

const tableRef = ref<HTMLTableElement | null> (null);
const resolvedId = props.tableId ?? `fb-datatable-${Math.random ().toString (36).slice (2, 9)}`;

let dataTable: DataTable | null = null;

function destroyTable (): void {
    dataTable?.destroy ();
    dataTable = null;
}

function initTable (): void {
    if (! tableRef.value) {
        return;
    }

    destroyTable ();
    dataTable = new DataTable (tableRef.value, props.options ?? {});
}

onMounted(() => {
    initTable ();
});

onBeforeUnmount(() => {
    destroyTable ();
});

watch(() => props.options, () => {
    initTable ();
}, { deep: true });
</script>

<template>
    <div :class="cn(fbDataTableWrap, wrapperClass)">
        <table
            :id="resolvedId"
            ref="tableRef"
            :class="fbDataTable">
            <slot />
        </table>
    </div>
</template>
