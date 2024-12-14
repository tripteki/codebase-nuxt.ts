<script setup>

const isLoading = ref (false);
const isLoaded = ref (false);
const isError = ref (false);
const isSuccess = ref (false);
const validationMessage = ref ("");

const formUserIdentity = ref ("");
const formUserPassword = ref ("");
const formCheckboxRemember = ref (false);

const { t, } = useI18n ();

const { signIn, } = useAuth ();

definePageMeta (
{
    title: "Login",

    auth: {

        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/admin/dashboard",
    },
});

const load = () =>
{
    isLoading.value = true;
    isLoaded.value = false;
};

const reset = () =>
{
    isLoading.value = false;
    isLoaded.value = true;
};

const login = async (e) =>
{
    e.preventDefault ();

    load ();

    try {

        const data = await signIn (
        {
            identifier: formUserIdentity.value,
            password: formUserPassword.value,
            remember: formCheckboxRemember.value,
        },
        {
            callbackUrl: "/admin/dashboard",
        });

        isSuccess.value = true;

    } catch (throwable) {

        const { errors, } = throwable?.response?._data;

        if (Object.keys (errors).length) {

            isError.value = true;
            validationMessage.value = t ("auth.failed");

        } else {

            isError.value = false;
            validationMessage.value = "";
        }

    } finally {

        reset ();
    };
};

</script>

<template>
<div class="container mx-auto text-center">
    <div class="grid grid-cols-2">
        <div class="p-3">
            <span>{{ $t ("auth.dont_have_an_account_yet") }}</span>
            <span>
                <NuxtLink to="/auth/registration">&nbsp;{{ $t ("auth.sign_up_here") }}</NuxtLink>
            </span>
        </div>
        <div class="p-3">
            <button @click="navigateTo ('https://google.com', { external: true, })" type="button">
                {{ $t ("auth.sign_in_with_google") }}
            </button>
        </div>
    </div>
    <form class="grid grid-rows-none gap-8 p-3 border">
        <div><InputComponent v-model="formUserIdentity" type="email" name="email" label="E-Mail" placeholder="user@email.com" :isLoaded="true" /></div>
        <div><InputComponent v-model="formUserPassword" type="password" name="password" label="Password" placeholder="********" :isLoaded="true" /></div>
        <div>
            <label for="remember">{{ $t ("auth.remember") }}</label>
            <input v-model="formCheckboxRemember" type="checkbox" name="remember" id="remember" />
        </div>
        <p v-if="isError" v-text="validationMessage"></p>
        <button @click="login" type="submit" class="border">{{ $t ("auth.sign_in") }}</button>
        <v-btn icon="mdi-account" color="primary"></v-btn>
    </form>
</div>
</template>
