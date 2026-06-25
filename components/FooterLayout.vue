<script setup lang="ts">
import { useTranslation, } from "#imports";

import { fbMuted, } from "@/lib/flowbite-classes";

const { t, } = useTranslation ("common");
</script>

<template>
    <footer class="mt-auto border-t border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 py-4">
            <p :class="['text-center', fbMuted]">
                © {{ new Date ().getFullYear () }} {{ t ("all_rights_reserved") }}
            </p>
        </div>
    </footer>
</template>
