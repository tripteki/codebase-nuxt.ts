<script setup lang="ts">
import { useTranslation, } from "#imports";

const { t, } = useTranslation ("common");
</script>

<template>
    <footer class="border-t mt-auto">
        <div class="container mx-auto px-4 py-4">
            <p class="text-center text-sm text-muted-foreground">
                © {{ new Date ().getFullYear () }} {{ t ("all_rights_reserved") }}
            </p>
        </div>
    </footer>
</template>
