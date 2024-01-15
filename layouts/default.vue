<script setup>

const configuration = useRuntimeConfig ();

useHead ({

    htmlAttrs: {

        lang: configuration.public.language,
    },

    title: "Default",
    titleTemplate: 'Vue | %s',
});

</script>

<template>
<v-container>
    <v-layout class="text-center">
        <v-system-bar window>...</v-system-bar>
        <v-app-bar title="..."></v-app-bar>
        <v-navigation-drawer><v-list>...</v-list></v-navigation-drawer>
        <v-main>
            <slot />
        </v-main>
        <v-spacer></v-spacer>
        <v-footer app>...</v-footer>
        <v-bottom-navigation>...</v-bottom-navigation>
    </v-layout>
</v-container>
</template>