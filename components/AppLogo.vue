<script setup lang="ts">
import { type HTMLAttributes, } from "vue";

import { cn, } from "@/lib/utils";

const props = defineProps<{
    class?: HTMLAttributes["class"];
}>();

const MANIFEST_LOGO_SRC = "/manifest/asset/logo.png";
</script>

<template>
    <img
        :src="MANIFEST_LOGO_SRC"
        alt=""
        width="120"
        height="32"
        :class="cn ('h-8 w-auto object-contain', props.class)" />
</template>
