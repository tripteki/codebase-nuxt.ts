<script setup>

definePageMeta ({

    layout: "dashboard",
    title: "Index",
});

onMounted (async () =>
{
    await navigateTo ('/auth/login');
});

</script>

<template>
    <div class="underline">{{ $t ("common.welcome") }}</div>
    <!-- <ClientOnly>
        <apexchart />
    </ClientOnly> -->
</template>
