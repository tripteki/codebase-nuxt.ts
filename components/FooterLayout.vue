<script setup lang="ts">
import { useTranslation, } from "#imports";

import { fbMuted, } from "@/lib/flowbite-classes";

const { t, } = useTranslation ("common");
</script>

<template>
    <footer class="mt-auto border-t border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div class="py-2">
            <p :class="['text-center', fbMuted]">
                © {{ new Date ().getFullYear () }} {{ t ("all_rights_reserved") }}
            </p>
        </div>
    </footer>
</template>
