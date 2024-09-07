"use strict";

import VueApexCharts from 'vue3-apexcharts';

export default defineNuxtPlugin ((plugin) =>
{
    plugin.vueApp.use (VueApexCharts);
});
