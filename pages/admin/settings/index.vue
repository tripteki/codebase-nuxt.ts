<script setup lang="ts">
import { navigateTo, } from "#imports";

import { definePageAuthed, } from "@/lib/define-page-auth";

definePageAuthed ();

await navigateTo ("/admin/settings/personal", { replace: true, });
</script>

<template>
    <div />
</template>
