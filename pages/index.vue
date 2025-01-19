<script setup lang="ts">

definePageMeta ({

    layout: "default",
});

useHead ({

    title: "Index",
});

</script>

<template>
    <div class="mx-2">
        <div>{{ $t ("common.welcome") }}</div>
        <select v-model="$i18n.locale" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-25 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale.toUpperCase () }}</option>
        </select>
    </div>
</template>
