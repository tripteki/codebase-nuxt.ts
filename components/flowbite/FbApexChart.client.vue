<script setup lang="ts">
import { computed, } from "vue";
import { useColorMode, } from "#imports";

import { fbCard, } from "@/lib/flowbite-classes";
import {
    createFlowbiteChartOptions,
    readFlowbiteChartColorsFromDocument,
    type FlowbiteApexChartType,
} from "@/lib/flowbite-chart-options";
import { cn, } from "@/lib/utils";

const props = withDefaults(
    defineProps<{
        type?: FlowbiteApexChartType;
        height?: string | number;
        width?: string | number;
        options?: Record<string, unknown>;
        series: Array<Record<string, unknown>> | number[];
        card?: boolean;
        wrapperClass?: string;
    }>(),
    {
        type: "area",
        height: 320,
        card: false,
    }
);

const colorMode = useColorMode ();

const mergedOptions = computed(() => {
    const isDark = colorMode.value === "dark";
    const chartColors = readFlowbiteChartColorsFromDocument ();

    return createFlowbiteChartOptions (isDark, {
        chart: { type: props.type },
        ...(props.options ?? {}),
    }, chartColors);
});
</script>

<template>
    <div :class="cn(card && fbCard, wrapperClass)">
        <apexchart
            :type="type"
            :height="height"
            :width="width"
            :options="mergedOptions"
            :series="series" />
    </div>
</template>
