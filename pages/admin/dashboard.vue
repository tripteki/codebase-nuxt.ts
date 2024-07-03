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
    <div class="container mx-auto mt-3 text-center">
        <button @click="logout" type="button" class="border">Sign out</button>
    </div>
</template>
