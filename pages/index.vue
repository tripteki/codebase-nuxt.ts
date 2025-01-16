<script setup lang="ts">

import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar";

definePageMeta ({

    layout: "default",
});

useHead ({

    title: "Index",
});

</script>

<template>
    <div class="underline">{{ $t ("common.welcome") }}</div>

    <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback></AvatarFallback>
    </Avatar>
</template>
