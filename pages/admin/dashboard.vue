<script setup>

definePageMeta (
{
    title: "Dashboard",
    middleware: "auth",
});

const { signOut, } = useAuth ();

const logout = async (e) =>
{
    e.preventDefault ();

    try {

        const data = await signOut (
        {
            redirect: true,
            callbackUrl: "/auth/login",
        });

    } catch (throwable) {

        console.error (throwable);
    };
};

</script>

<template>
    <div class="container m-2">
        <button @click="logout" type="button" class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-blue-900 dark:text-blue-400">Sign out</button>
    </div>
</template>
